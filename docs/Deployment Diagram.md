@startuml Deployment Diagram - BrewLite Production Environment

skinparam BackgroundColor #FFFFFF
skinparam Shadowing false
skinparam DefaultFontName "Arial"
skinparam DefaultFontSize 12
skinparam DefaultFontColor #202124

skinparam cloud {
    BackgroundColor #F8F9FA
    BorderColor #5F6368
    FontColor #202124
}

skinparam node {
    BackgroundColor #F1F3F4
    BorderColor #80868B
    FontColor #202124
}

skinparam component {
    BackgroundColor #E8F0FE
    BorderColor #1A73E8
    FontColor #174EA6
}

skinparam database {
    BackgroundColor #FEF7E0
    BorderColor #FBBC04
    FontColor #B06000
}

skinparam note {
    BackgroundColor #FFF8E1
    BorderColor #FFE082
    FontColor #37474F
}

skinparam arrow {
    Color #3C4043
    FontColor #202124
}

skinparam componentStyle uml2 
skinparam nodeNodePadding 18 
skinparam frameStyle rectangle 
title Sơ đồ Triển khai Hạ tầng BrewLite (UML Deployment Diagram - Production Environment) 

cloud "Internet Public Network" as internet 

node "Thiết bị Khách hàng (Client Device)" as user_device { 
  node "Mobile Browser / PWA" as mobile_pwa { 
    artifact "Next.js Web Client App\n(Order Ahead & Pickup)" as next_client 
  } 
} 

node "Thiết bị Quầy / Cửa hàng (Store Terminal)" as store_device { 
  node "Store POS Browser / Tablet" as store_browser { 
    artifact "Store Dashboard UI\n(Real-time Order Monitoring)" as store_ui 
  } 
} 

node "Hạ tầng CI/CD (GitHub Environment)" as github_env { 
  frame "GitHub Actions Runner" as gh_actions 
  database "GitHub Container Registry (GHCR)" as ghcr { 
    artifact "BrewLite API Docker Image\n(Tagged commit SHA / semver)" as docker_img 
  } 
} 

package "Hạ tầng Cloud Production (Vercel & Render/Railway)" { 
  node "Frontend Hosting Node (Vercel / Render Static)" as fe_node { 
    component "Next.js Application\n(apps/web - PWA)" as fe_app 
  } 
  node "Backend API Container Node (Render / Railway Web Service)" as be_node { 
    component "NestJS REST API App\n(apps/api)" as be_api 
    component "WebSocket Server\n(Socket.io / WSS Gateways)" as ws_server 
    interface "GET /health" as health_endpoint 
    be_api - health_endpoint 
  } 
  node "Database Server Node (Render / Railway Managed PostgreSQL)" as db_node { 
    database "PostgreSQL Database\n(Persistent Storage Volume)" as postgres_db 
  } 
  node "External Service Node (Mock Payment Provider)" as ext_node { 
    component "Mock Payment Service Gateway\n(Idempotency Key Check)" as payment_mock 
  } 
} 

' Web Connections 
user_device -- internet : HTTPS (Port 443) 
store_device -- internet : HTTPS & WSS (Port 443) 
internet --> fe_node : HTTPS (Tải PWA App) 
internet --> be_node : REST API Requests (HTTPS) 
store_device ..> ws_server : Kết nối WebSocket (WSS)\n[Nhận thông báo đơn mới theo thời gian thực] 

' Internal Service Connections 
fe_node --> be_node : REST API Communication 
be_node --> ext_node : HTTP/HTTPS API Calls & Webhook Callbacks 
be_node --> db_node : Internal TCP Connection (Port 5432)\n[Encrypted via DATABASE_URL] 

' CI/CD Pipeline Flow 
gh_actions --> ghcr : Push Docker Image khi Merge Code 
ghcr --> be_node : Auto-pull Image & Deploy 

note right of be_node 
**Biến môi trường & Secrets:** 
- DATABASE_URL 
- JWT_SECRET 
- PORT 
end note 

note right of db_node 
**Bảo mật & Dữ liệu:** 
- Mạng riêng nội bộ (Private Network - Non Public IP) 
- Tự động chạy Database Migration (Prisma) 
end note 

@enduml