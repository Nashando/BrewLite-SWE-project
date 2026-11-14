param([string]$OutputDirectory = '', [switch]$RunTests)
$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $env:TEMP ('brewlite-compose-evidence-' + [guid]::NewGuid().ToString('N')) }
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$OutputDirectory = (Resolve-Path -LiteralPath $OutputDirectory).Path
$summary = [ordered]@{ startedAt = [DateTime]::UtcNow.ToString('o'); status = 'running'; environment = 'local Docker Compose'; testsRequested = [bool]$RunTests }
$projectName = 'brewlite-qa-' + [guid]::NewGuid().ToString('N').Substring(0,8)
$touchedVariables = @{}
$started = $false
$exitResult = 0
function Set-TaskEnvironment([string]$Name, [string]$Value) {
    $script:touchedVariables[$Name] = [Environment]::GetEnvironmentVariable($Name, 'Process')
    [Environment]::SetEnvironmentVariable($Name, $Value, 'Process')
}
function Free-Port {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $listener.Start(); $allocatedPort = $listener.LocalEndpoint.Port; $listener.Stop()
    return $allocatedPort
}
function Compose([string[]]$Arguments, [string]$Log) {
    & docker compose --project-directory $repositoryRoot --project-name $projectName -f (Join-Path $repositoryRoot 'docker-compose.yml') @Arguments *> (Join-Path $OutputDirectory $Log)
    if ($LASTEXITCODE -ne 0) { throw "Docker Compose failed; see $Log" }
}
try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { $summary.status = 'blocked'; throw 'Docker CLI/engine is not installed. Install/start Docker before running this verifier.' }
    & docker info --format '{{.ServerVersion}}' *> (Join-Path $OutputDirectory 'docker-version.log')
    if ($LASTEXITCODE -ne 0) { $summary.status = 'blocked'; throw 'Docker engine is unavailable.' }
    $baseSha = (& git -C $repositoryRoot rev-parse HEAD).Trim()
    $summary.baseCommit = $baseSha
    $summary.dirty = (@(& git -C $repositoryRoot status --porcelain).Count -gt 0)

    $dbPort = Free-Port; $apiPort = Free-Port; $webPort = Free-Port
    $password = [guid]::NewGuid().ToString('N')
    $values = @{
        POSTGRES_PORT = "$dbPort"; API_PORT = "$apiPort"; WEB_PORT = "$webPort"; POSTGRES_USER = 'brewlite'; POSTGRES_DB = 'brewlite'; POSTGRES_PASSWORD = $password;
        JWT_SECRET = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'); JWT_REFRESH_SECRET = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N');
        API_URL = "http://127.0.0.1:$apiPort"; WEB_URL = "http://127.0.0.1:$webPort"; CORS_ORIGIN = "http://127.0.0.1:$webPort"; NEXT_PUBLIC_API_URL = "http://127.0.0.1:$apiPort";
        DATABASE_URL = "postgresql://brewlite:$password@127.0.0.1:$dbPort/brewlite"; TZ = 'UTC'; NEXT_PUBLIC_API_MOCKING = 'disabled'; EXPECTED_COMMIT = ''
    }
    foreach ($entry in $values.GetEnumerator()) { Set-TaskEnvironment $entry.Key $entry.Value }
    $started = $true
    Compose @('up','--build','-d','--wait','--wait-timeout','300') 'compose-up.log'
    Compose @('exec','-T','api','npm','run','seed') 'compose-seed.log'
    Compose @('ps','--format','json') 'compose-ps.json'
    & node (Join-Path $repositoryRoot 'tests/helpers/smoke.mjs') *> (Join-Path $OutputDirectory 'compose-smoke.log')
    if ($LASTEXITCODE -ne 0) { throw 'Compose smoke failed' }
    if ($RunTests) {
        Push-Location (Join-Path $repositoryRoot 'tests')
        try { & npm.cmd test *> (Join-Path $OutputDirectory 'compose-tests.log'); if ($LASTEXITCODE -ne 0) { throw 'Integration/E2E on Compose failed' } }
        finally { Pop-Location }
    }
    $summary.status = 'passed'
} catch {
    if ($summary.status -ne 'blocked') { $summary.status = 'failed' }
    $summary.error = $_.Exception.Message
    $exitResult = if ($summary.status -eq 'blocked') { 2 } else { 1 }
} finally {
    if ($started) {
        try { Compose @('logs','--no-color','--timestamps','--tail','200') 'compose-services.log' } catch { $summary.logsError = $_.Exception.Message }
        try { Compose @('down','--volumes','--remove-orphans') 'compose-down.log'; $summary.cleanedUp = $true } catch { $summary.cleanedUp = $false; $exitResult = 1 }
    }
    foreach ($entry in $touchedVariables.GetEnumerator()) { [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, 'Process') }
    $summary.finishedAt = [DateTime]::UtcNow.ToString('o')
    $summary | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'compose-result.json') -Encoding UTF8
}
Write-Output "Compose verification: $($summary.status). Evidence: $OutputDirectory"
exit $exitResult
