# JobPortal - Enterprise Job Portal Web Application

A full-stack, enterprise-grade Job Portal built with **ASP.NET Core 8 Web API**, **React 18 (TypeScript + Vite + Tailwind CSS)**, **Entity Framework Core**, and built-in **AI/ML/LLM Intelligence** with **CI/CD + Docker Orchestration**.




## Running Locally for Development

### 1. Running Backend & Unit Tests
```bash
# Set .NET path if needed
$env:DOTNET_ROOT = "$env:USERPROFILE\.dotnet"; $env:Path = "$env:USERPROFILE\.dotnet;" + $env:Path

# Run automated unit tests
dotnet test backend.Tests/JobPortal.Tests.csproj

# Run backend API
cd backend
dotnet run --urls "http://localhost:5000"
```

### 2. Running Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** (or `http://localhost:5174` if port is occupied; both are supported by CORS dynamically).

---

