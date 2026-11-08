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
    node "Mobile / Desktop Browser" as browser { 
        artifact "Next.js Web Client App\n(apps/web - Order Ahead & Pickup)" as next_client 
    } 
} 

node "Hạ tầng CI/CD (GitHub Actions)" as github_env { 
    frame "GitHub Actions Runner\n(CI/CD Pipeline: lint, test, build)" as gh_actions 
    database "GitHub Container Registry (GHCR)" as ghcr { 
        artifact "BrewLite API Docker Image\n(Tagged SHA / Semver)" as docker_img 
    } 
} 

package "Hạ tầng Cloud Production" { 
    node "Frontend Hosting Node (Vercel)" as fe_node { 
        component "Next.js Production Build\n(Static / SSR)" as fe_app 
    } 
    
    node "Backend API Container Node (Render Web Service)" as be_node { 
        component "NestJS REST API App\n(apps/api - Port 3001/3000)" as be_api 
        note bottom of be_api
          Bên trong API App chứa sẵn:
          - Order & Checkout Module
          - Payment Module (Mock Payment Logic)
          - Prisma ORM Service
        end note
        interface "GET /health" as health_endpoint 
        be_api - health_endpoint 
    } 
    
    node "Database Server Node (Render Managed PostgreSQL)" as db_node { 
        database "PostgreSQL Database\n(Persistent Storage Volume - Port 5432)" as postgres_db 
    } 
} 

' Web Connections 
user_device -- internet : HTTPS (Port 443) 
internet --> fe_node : HTTPS (Truy cập Web Client) 
internet --> be_node : REST API Requests (HTTPS / Port 443 -> 3001) 

' Internal Service Connections 
fe_node --> be_node : Client-side API Calls (CORS Enabled) 
be_node --> db_node : Internal TCP Connection (Port 5432)\n[Encrypted via DATABASE_URL] 

' CI/CD Pipeline Flow 
gh_actions --> ghcr : Build & Push Docker Image khi Merge Code 
ghcr --> be_node : Auto-deploy Container 

note right of be_node 
**Biến môi trường Production:** 
- PORT=3001 
- DATABASE_URL 
- JWT_SECRET 
- JWT_REFRESH_SECRET
- CORS_ORIGIN 
end note 

note right of db_node 
**Bảo mật & Dữ liệu:** 
- Mạng riêng nội bộ (Private Network - Non Public IP) 
- Tự động chạy Prisma Migration khi khởi động 
end note 

@enduml