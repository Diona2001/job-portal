# JobPortal - Enterprise Job Portal Web Application

A full-stack, enterprise-grade Job Portal built with **ASP.NET Core 8 Web API**, **React 18 (TypeScript + Vite + Tailwind CSS)**, and **Entity Framework Core**.

---

## Architecture Overview

```
job-portal/
├── backend/                  # ASP.NET Core 8 Web API
│   ├── Controllers/          # RESTful API Controllers with Role-based Authorization
│   ├── Data/                 # EF Core ApplicationDbContext & Seed Data Initializer
│   ├── DTOs/                 # Request & Response Data Transfer Objects
│   ├── Entities/             # Domain Model Entities (User, Job, Application, etc.)
│   ├── Migrations/           # EF Core Migration files (SQL Server & SQLite compatible)
│   ├── Services/             # JWT, Password Hasher, and Local/Cloud File Storage Services
│   ├── Uploads/              # Local storage folder for candidate resumes
│   ├── appsettings.json      # Configuration (Connection strings, JWT, Logging)
│   └── Program.cs            # DI container, CORS, JWT Auth, Swagger, and Dual-DB setup
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/              # Axios HTTP client with JWT request interceptors
│   │   ├── components/       # Reusable UI components (Navbar, Footer, Layouts)
│   │   ├── context/          # React Context (AuthContext for user state)
│   │   ├── pages/            # 16+ Application Pages across all user roles
│   │   │   ├── admin/        # Admin Dashboard (Recharts), User/Company/Job moderation
│   │   │   ├── employer/     # Employer Dashboard, Post Job, Manage Jobs, Pipeline & Interviews
│   │   │   ├── seeker/       # Seeker Dashboard, Profile, Applications, Saved Jobs
│   │   │   └── ...           # Landing, Find Jobs, Job Details, Login, Register
│   │   ├── types/            # TypeScript interfaces matching backend DTOs
│   │   ├── App.tsx           # Declarative React Router routing with Protected Routes
│   │   └── main.tsx          # App entry point
│   └── package.json
└── README.md
```

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with responsive, modern aesthetic
- **Routing**: React Router DOM (v6) with role-guarded Route wrappers
- **HTTP Client**: Axios with automated bearer token interception
- **Forms & Validation**: Controlled forms with validation handling
- **Data Visualization**: Recharts for dynamic visual dashboards
- **Icons**: Lucide React

### Backend
- **Framework**: ASP.NET Core 8 Web API
- **ORM**: Entity Framework Core 8.0
- **Database Engine**: Microsoft SQL Server with automatic plug-and-play fallback to SQLite
- **Security & Auth**: JWT (JSON Web Tokens) with HMAC-SHA256 & BCrypt password hashing
- **File Storage**: Clean `IFileStorageService` abstraction supporting Local Disk & Cloud S3
- **Documentation**: Swagger / OpenAPI (Swashbuckle 6.6.2)

---

## Ready-to-Use Demo Accounts

The login page (`/login`) includes **1-Click Quick Demo Login** buttons for instant access:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@jobportal.com` | `Admin@123` | System administrator with full moderation and analytics |
| **Employer** | `arun@techcorp.in` | `Password@123` | Hiring manager at *TechCorp Solutions* (Bangalore) |
| **Job Seeker** | `rahul.sharma@example.com` | `Password@123` | Senior Full-Stack Engineer with active applications |

*Additional seeded accounts include `priya.patel@example.com`, `amit.verma@example.com`, and employers at `FinScale Systems`, `CloudNative Bharat`, and `Malabar Digital`.*

---

## Getting Started

### Prerequisites
- **.NET 8 SDK** (verify with `dotnet --version`)
- **Node.js 18+** & **npm** (verify with `node -v` and `npm -v`)

---

### 1. Running the Backend

Navigate to the `backend` folder:
```bash
cd backend
```

Restore dependencies and run:
```bash
dotnet run --urls "http://localhost:5000"
```

The API will automatically:
1. Detect whether Microsoft SQL Server is active. If unreachable, it cleanly uses SQLite (`jobportal.db`) without throwing errors.
2. Apply pending EF Core migrations.
3. Seed default admin, companies, 20+ realistic Indian tech jobs, job seeker profiles, applications, timeline histories, interviews, and notifications.
4. Host Swagger UI at: **`http://localhost:5000/swagger`**

#### Connecting to your own Microsoft SQL Server
Update `ConnectionStrings:DefaultConnection` in `backend/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=JobPortalDb;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
},
"DatabaseProvider": "SqlServer"
```

To run migrations manually against SQL Server:
```bash
dotnet ef database update --connection "Server=YOUR_SERVER;Database=JobPortalDb;TrustServerCertificate=True;Trusted_Connection=True;"
```

---

### 2. Running the Frontend

Navigate to the `frontend` folder:
```bash
cd frontend
```

Install dependencies and start the Vite dev server:
```bash
npm install
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## Key Features by Role

### 🌐 Public & Job Search
- **Landing Page**: Hero search bar, live market metrics, trending categories, featured jobs, and partner company logos.
- **Find Jobs**: Filter by search keyword, location, job type (FullTime, PartTime, Contract, Internship), workplace type (Onsite, Remote, Hybrid), and experience level.
- **Job Details**: Rich descriptions, responsibilities, requirements, salary badges, company profile preview, and direct resume upload modal.

### 👤 Job Seeker
- **Dashboard**: Quick metrics (applied jobs, shortlisted, interviews, saved jobs) and recent activity stream.
- **Profile Management**: Professional bio, phone, address, skills tags, portfolio link, LinkedIn URL, GitHub URL, and PDF/DOCX resume file uploader.
- **My Applications**: Visual status badges (`Applied`, `Reviewing`, `Shortlisted`, `InterviewScheduled`, `Rejected`, `Hired`) with historical feedback notes.
- **Saved Jobs**: Quick bookmarking to save jobs for later review.
- **Notifications**: Real-time updates when an employer updates application status or schedules an interview.

### 🏢 Company / Employer
- **Company Profile**: Brand logo, tagline, company size, industry, website, and company description.
- **Post & Edit Jobs**: Comprehensive job creation with salary range, benefits, skills list, application deadlines, and workplace settings.
- **My Jobs**: Manage posted job listings with active/closed status toggles.
- **Candidate Pipeline**: Filter candidates by job, review applicant profiles, download attached resumes, update application status with custom notes, and schedule interviews with date/time and meeting links.
- **Dashboard Analytics**: Visual bar and line charts (Recharts) showing job post performance, applicant trends, and upcoming interviews.

### 🛡️ Platform Admin
- **Platform Analytics**: Total users, total jobs, total applications, and active platform companies with Recharts visualizations.
- **User Management**: Search users by name or email, filter by role, and toggle active/inactive account status.
- **Company Verification**: Review employer profiles and toggle company verification badges.
- **Job Moderation**: Inspect and moderate all job postings across the entire platform.

---

## Automated Verification Suite

An automated Python test suite is included in the project to verify all 14 end-to-end workflows (auth, job filtering, posting, duplicate prevention, candidate status changes, notifications, and admin moderation):

```bash
python test_portal.py
```
