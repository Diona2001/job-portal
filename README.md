# JobPortal - Enterprise Job Portal Web Application

A full-stack, enterprise-grade Job Portal built with **ASP.NET Core 8 Web API**, **React 18 (TypeScript + Vite + Tailwind CSS)**, **Entity Framework Core**, and built-in **AI/ML/LLM Intelligence** with **CI/CD + Docker Orchestration**.

---

## Architecture Overview

```
job-portal/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # GitHub Actions CI: .NET build/test + React build
│       └── docker.yml             # Docker build and container verification workflow
├── backend/                      # ASP.NET Core 8 Web API
│   ├── Controllers/              # RESTful API Controllers with Role-based Authorization & AI endpoints
│   ├── Data/                     # EF Core ApplicationDbContext & Seed Data Initializer
│   ├── DTOs/                     # Request & Response Data Transfer Objects (Auth, Jobs, Ai, etc.)
│   ├── Entities/                 # Domain Model Entities (User, Job, Application, etc.)
│   ├── Migrations/               # EF Core Migration files (SQL Server & SQLite compatible)
│   ├── Services/                 # JWT, BCrypt, IFileStorageService, and IAiService
│   ├── Uploads/                  # Local storage folder for candidate resumes
│   ├── appsettings.json          # Configuration (Connection strings, JWT, GeminiSettings)
│   ├── Dockerfile                # Multi-stage .NET 8 SDK + ASP.NET Core runtime image
│   └── Program.cs                # DI container, CORS, JWT Auth, Swagger, and Dual-DB setup
├── backend.Tests/                # Automated xUnit unit testing project
│   ├── JobPortal.Tests.csproj    # Test project targeting net8.0
│   └── AiServiceTests.cs         # Unit tests for matching algorithms, extraction & generators
├── frontend/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                  # Axios HTTP client with JWT interceptor & AI endpoints
│   │   ├── components/           # Reusable UI components (Navbar, Footer, Modals, Badges)
│   │   ├── context/              # React Context (AuthContext for user state)
│   │   ├── pages/                # 16+ Application Pages across all user roles
│   │   │   ├── admin/            # Admin Dashboard (Recharts), User/Company/Job moderation
│   │   │   ├── employer/         # Employer Dashboard, Post Job (AI Assistant), Candidates (AI Fit)
│   │   │   ├── seeker/           # Seeker Dashboard, Profile (AI Polish), Applications, Saved Jobs
│   │   │   └── ...               # Landing, Find Jobs, Job Details (AI Match & Cover Letter)
│   │   ├── types/                # TypeScript interfaces matching backend DTOs & AI types
│   │   ├── App.tsx               # Declarative React Router routing with Protected Routes
│   │   └── main.tsx              # App entry point
│   ├── nginx.conf                # Production Nginx SPA routing config
│   ├── Dockerfile                # Multi-stage Node.js build + Nginx Alpine runtime
│   └── package.json
├── docker-compose.yml            # Full-stack orchestration (Backend + Frontend + SQL Server)
└── README.md
```

---

## AI / ML / LLM Capabilities

The portal features a **Dual-Mode AI Engine**:
1. **Google Gemini LLM Integration**: Generates deep generative responses when `GeminiSettings:ApiKey` (or `GEMINI_API_KEY` env var) is provided.
2. **Built-in Local Heuristic NLP Engine**: Operates natively when no API key is configured or offline, using TF-IDF vector cosine similarity, a taxonomy of 120+ modern tech skills, and structured templates.

### Key AI Features:
- **Real-Time Job Match & Gap Analysis**: Calculates candidate-to-job compatibility score (0-100%), displays matching skills (green), missing skills (amber), and delivers actionable recommendations directly in `JobDetails.tsx`.
- **AI Cover Letter Auto-Drafter**: Inside the job application modal, candidates can generate a tailored cover letter customized by tone ("Professional", "Confident", "Enthusiastic").
- **AI Job Description Assistant**: In `PostJob.tsx`, employers enter a title and experience level to auto-generate a comprehensive description, responsibilities, requirements, and recommended skills tags.
- **AI Profile Polish & Skill Extractor**: In `Profile.tsx`, candidates can enhance their executive summary, auto-extract industry-standard skill tags, and receive resume ATS advice.
- **AI Candidate Fit Analysis**: In `Candidates.tsx`, employers review applicants with an instant AI Fit score and inspect candidate strengths and skill gaps before scheduling interviews.
- **Interactive AI Career Chatbot**: Accessible globally via a floating assistant drawer (`AiChatbot.tsx`). Answers career questions, advises on resume ATS optimizations, runs interview preparation drills, and performs conversational job searches that render interactive job cards with direct application links.

---

## CI/CD Pipeline & Containerization

### GitHub Actions Workflows (`.github/workflows/`)
- **`ci.yml`**:
  - Automatically triggered on `push` and `pull_request` to `main`, `master`, and `develop`.
  - **Backend Job**: Sets up .NET 8 SDK, restores dependencies, builds in Release mode, and runs automated unit tests with code coverage collection.
  - **Frontend Job**: Sets up Node.js 20, caches npm dependencies, performs strict TypeScript type-checking, and bundles production assets.
- **`docker.yml`**:
  - Verifies multi-stage Docker builds for both backend and frontend images.





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

