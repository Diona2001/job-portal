using Microsoft.EntityFrameworkCore;
using JobPortal.API.Entities;

namespace JobPortal.API.Data;

public static class DbInitializer
{
    public static async Task SeedDataAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return;
        }

        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123");
        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");

        // 1. Create Admin
        var admin = new User
        {
            FullName = "Platform Administrator",
            Email = "admin@jobportal.com",
            PasswordHash = adminPasswordHash,
            Role = "Admin",
            Phone = "+91 9876543210",
            Location = "Bangalore, India",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-6)
        };
        context.Users.Add(admin);

        // 2. Create Employers
        var employer1 = new User
        {
            FullName = "Arun Verma",
            Email = "arun@techcorp.in",
            PasswordHash = defaultPasswordHash,
            Role = "Employer",
            Phone = "+91 9845012345",
            Location = "Bangalore, India",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-5)
        };

        var employer2 = new User
        {
            FullName = "Sneha Kulkarni",
            Email = "sneha@cloudwave.io",
            PasswordHash = defaultPasswordHash,
            Role = "Employer",
            Phone = "+91 9920198765",
            Location = "Hyderabad, India",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };

        var employer3 = new User
        {
            FullName = "Rohan Mehta",
            Email = "rohan@finscale.com",
            PasswordHash = defaultPasswordHash,
            Role = "Employer",
            Phone = "+91 9711234567",
            Location = "Mumbai, India",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };

        var employer4 = new User
        {
            FullName = "Kavita Menon",
            Email = "kavita@malabardigital.com",
            PasswordHash = defaultPasswordHash,
            Role = "Employer",
            Phone = "+91 9447123456",
            Location = "Kochi, India",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        context.Users.AddRange(employer1, employer2, employer3, employer4);
        await context.SaveChangesAsync();

        // 3. Create Companies
        var company1 = new Company
        {
            UserId = employer1.Id,
            CompanyName = "TechCorp Solutions",
            Description = "TechCorp is India's leading enterprise software solutions provider, empowering Fortune 500 companies with robust cloud, AI, and digital transformation capabilities.",
            Industry = "Information Technology",
            CompanySize = "500-1000 employees",
            Website = "https://techcorp.in",
            Location = "Bangalore, Karnataka",
            LogoUrl = "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces",
            IsVerified = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-5)
        };

        var company2 = new Company
        {
            UserId = employer2.Id,
            CompanyName = "CloudWave Technologies",
            Description = "Pioneers in high-velocity SaaS products, distributed systems, and real-time streaming architectures across healthcare and e-commerce domains.",
            Industry = "SaaS & Cloud Computing",
            CompanySize = "100-250 employees",
            Website = "https://cloudwave.io",
            Location = "Hyderabad, Telangana",
            LogoUrl = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&crop=faces",
            IsVerified = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };

        var company3 = new Company
        {
            UserId = employer3.Id,
            CompanyName = "FinScale Systems",
            Description = "Next-generation financial infrastructure and algorithmic trading platform powering high-frequency transactions with microsecond latency.",
            Industry = "Fintech",
            CompanySize = "50-100 employees",
            Website = "https://finscale.com",
            Location = "Mumbai, Maharashtra",
            LogoUrl = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&h=128&fit=crop&crop=faces",
            IsVerified = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };

        var company4 = new Company
        {
            UserId = employer4.Id,
            CompanyName = "Malabar Digital Innovations",
            Description = "A fast-growing product studio based in Infopark Kochi, engineering mobile and web experiences for clients across the Middle East and Europe.",
            Industry = "Software Development",
            CompanySize = "50-100 employees",
            Website = "https://malabardigital.com",
            Location = "Kochi, Kerala",
            LogoUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&crop=faces",
            IsVerified = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        context.Companies.AddRange(company1, company2, company3, company4);
        await context.SaveChangesAsync();

        // 4. Create Job Seekers & Profiles
        var seeker1 = new User
        {
            FullName = "Rahul Sharma",
            Email = "rahul.sharma@example.com",
            PasswordHash = defaultPasswordHash,
            Role = "JobSeeker",
            Phone = "+91 9812345678",
            Location = "Bangalore, India",
            ProfileImage = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var seeker2 = new User
        {
            FullName = "Priya Patel",
            Email = "priya.patel@example.com",
            PasswordHash = defaultPasswordHash,
            Role = "JobSeeker",
            Phone = "+91 9712345679",
            Location = "Pune, India",
            ProfileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var seeker3 = new User
        {
            FullName = "Ananya Sen",
            Email = "ananya.sen@example.com",
            PasswordHash = defaultPasswordHash,
            Role = "JobSeeker",
            Phone = "+91 9612345680",
            Location = "Mumbai, India",
            ProfileImage = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var seeker4 = new User
        {
            FullName = "Vikram Nair",
            Email = "vikram.nair@example.com",
            PasswordHash = defaultPasswordHash,
            Role = "JobSeeker",
            Phone = "+91 9512345681",
            Location = "Kochi, India",
            ProfileImage = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=128&h=128&fit=crop",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        context.Users.AddRange(seeker1, seeker2, seeker3, seeker4);
        await context.SaveChangesAsync();

        var profile1 = new JobSeekerProfile
        {
            UserId = seeker1.Id,
            CurrentJobTitle = "Senior Full Stack .NET Developer",
            Bio = "Passionate full stack software engineer with 5+ years building scalable distributed web services using ASP.NET Core, C#, React, TypeScript, and SQL Server.",
            Experience = "5+ Years",
            Education = "B.Tech in Computer Science, NIT Trichy",
            Skills = ".NET Core, C#, ASP.NET Web API, React, TypeScript, SQL Server, Entity Framework, Docker, Azure",
            ResumeFileName = "Rahul_Sharma_Resume.pdf",
            ResumeUrl = "/uploads/resumes/sample_resume.pdf",
            ResumeUploadedAt = DateTime.UtcNow.AddDays(-20),
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var profile2 = new JobSeekerProfile
        {
            UserId = seeker2.Id,
            CurrentJobTitle = "Lead Data Analyst & BI Engineer",
            Bio = "Data enthusiast specializing in exploratory data analysis, predictive statistical models, PowerBI dashboards, and complex SQL data pipelines.",
            Experience = "4 Years",
            Education = "M.Sc in Applied Statistics, Pune University",
            Skills = "SQL, Python, PowerBI, Tableau, Data Warehousing, Pandas, BigQuery, Excel",
            ResumeFileName = "Priya_Patel_CV.pdf",
            ResumeUrl = "/uploads/resumes/sample_resume.pdf",
            ResumeUploadedAt = DateTime.UtcNow.AddDays(-15),
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var profile3 = new JobSeekerProfile
        {
            UserId = seeker3.Id,
            CurrentJobTitle = "Product Designer & UI/UX Specialist",
            Bio = "Creating delightful, accessible user journeys and high-fidelity design systems for enterprise SaaS applications and consumer fintech products.",
            Experience = "3.5 Years",
            Education = "Bachelor of Design, NID Ahmedabad",
            Skills = "Figma, User Research, Wireframing, Prototyping, Design Systems, Tailwind CSS, Accessibility",
            ResumeFileName = "Ananya_Sen_Portfolio_Resume.pdf",
            ResumeUrl = "/uploads/resumes/sample_resume.pdf",
            ResumeUploadedAt = DateTime.UtcNow.AddDays(-10),
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var profile4 = new JobSeekerProfile
        {
            UserId = seeker4.Id,
            CurrentJobTitle = "DevOps & Cloud Platform Engineer",
            Bio = "Automating infrastructure, CI/CD pipelines, Kubernetes orchestration, and cloud observability for resilient microservices architectures.",
            Experience = "4 Years",
            Education = "B.Tech in Electronics & Communication, CUSAT",
            Skills = "Kubernetes, Docker, AWS, Azure, Terraform, GitHub Actions, Prometheus, Linux",
            ResumeFileName = "Vikram_Nair_Resume.pdf",
            ResumeUrl = "/uploads/resumes/sample_resume.pdf",
            ResumeUploadedAt = DateTime.UtcNow.AddDays(-5),
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        context.JobSeekerProfiles.AddRange(profile1, profile2, profile3, profile4);
        await context.SaveChangesAsync();

        // 5. Create 20+ Realistic Jobs
        var jobs = new List<Job>
        {
            new Job
            {
                CompanyId = company1.Id,
                Title = "Senior .NET Core Web API Developer",
                Description = "Join TechCorp as a Senior Backend Engineer to architect and build high-throughput microservices using .NET 8, EF Core, and SQL Server. You will lead technical design discussions and mentor junior developers.",
                Responsibilities = "Architect RESTful APIs using ASP.NET Core 8; Optimize SQL queries, execution plans, and indexes; Implement clean architecture and repository patterns; Collaborate with frontend engineers.",
                Requirements = "5+ years backend engineering in C# / .NET Core; Deep understanding of SQL Server and EF Core; Experience with Redis, message queues (RabbitMQ/Kafka); Unit testing with xUnit.",
                Skills = ".NET Core, C#, ASP.NET Web API, SQL Server, Entity Framework Core, Microservices, Redis",
                ExperienceLevel = "Senior",
                SalaryMin = 1800000,
                SalaryMax = 2800000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Bangalore, Karnataka",
                Benefits = "Health insurance, Annual bonus, Flexible work hours, Learning budget of ₹50,000/year",
                ApplicationDeadline = DateTime.UtcNow.AddDays(45),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-18)
            },
            new Job
            {
                CompanyId = company1.Id,
                Title = "Full Stack React & .NET Engineer",
                Description = "We are seeking a versatile Full Stack Engineer to build next-generation web portals for global enterprise clients using React 18, TypeScript, Tailwind CSS, and ASP.NET Core.",
                Responsibilities = "Develop responsive frontends with React, TypeScript, and Vite; Integrate backend APIs and manage client state; Write end-to-end and component tests; Participate in agile sprints.",
                Requirements = "3-6 years full stack experience; Solid proficiency with React, TypeScript, and Tailwind CSS; Good working knowledge of C# Web API and relational databases.",
                Skills = "React, TypeScript, Tailwind CSS, .NET Core, C#, RESTful APIs, Git",
                ExperienceLevel = "Mid",
                SalaryMin = 1400000,
                SalaryMax = 2200000,
                EmploymentType = "FullTime",
                WorkplaceType = "Remote",
                Location = "Remote, India",
                Benefits = "Home office setup allowance, Comprehensive medical insurance, Stock options",
                ApplicationDeadline = DateTime.UtcNow.AddDays(30),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new Job
            {
                CompanyId = company1.Id,
                Title = "DevOps & Cloud Infrastructure Lead",
                Description = "Lead TechCorp's cloud platform team. You will be responsible for our multi-region Azure infrastructure, Kubernetes clusters, and automated CI/CD pipelines.",
                Responsibilities = "Manage Kubernetes clusters and containerized deployments; Automate infrastructure as code using Terraform; Maintain 99.99% uptime with Prometheus and Grafana alerting.",
                Requirements = "6+ years in DevOps / SRE; Deep expertise in Azure / AWS and Kubernetes; Hands-on scripting in Bash / PowerShell; Experience managing SQL Server High Availability.",
                Skills = "DevOps, Kubernetes, Docker, Azure, Terraform, CI/CD, Prometheus",
                ExperienceLevel = "Lead",
                SalaryMin = 2400000,
                SalaryMax = 3600000,
                EmploymentType = "FullTime",
                WorkplaceType = "Onsite",
                Location = "Bangalore, Karnataka",
                Benefits = "Car lease policy, Executive wellness package, Generous stock incentives",
                ApplicationDeadline = DateTime.UtcNow.AddDays(60),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-25)
            },
            new Job
            {
                CompanyId = company2.Id,
                Title = "Frontend Architect (React + TypeScript)",
                Description = "CloudWave is looking for an exceptional Frontend Architect to drive the design system, performance optimizations, and state management architecture of our flag-ship SaaS product.",
                Responsibilities = "Design reusable component libraries and design tokens; Enforce accessibility (WCAG AA) and Core Web Vitals performance; Lead technical frontend roadmap.",
                Requirements = "7+ years frontend engineering; Mastery of React, TypeScript, Vite, Webpack, and Tailwind CSS; Proven track record scaling large single-page applications.",
                Skills = "React, TypeScript, Tailwind CSS, Frontend Architecture, Performance Optimization, Recharts",
                ExperienceLevel = "Lead",
                SalaryMin = 2800000,
                SalaryMax = 4200000,
                EmploymentType = "FullTime",
                WorkplaceType = "Remote",
                Location = "Remote, India",
                Benefits = "Unlimited PTO, Work from anywhere policy, Annual company retreats in Goa",
                ApplicationDeadline = DateTime.UtcNow.AddDays(35),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new Job
            {
                CompanyId = company2.Id,
                Title = "Senior Backend Engineer (Distributed Systems)",
                Description = "Build low-latency messaging backends and event-driven microservices handling 50M+ events daily across multi-tenant SaaS environments.",
                Responsibilities = "Develop high-scale backend services in C# / Go; Optimize distributed caching with Redis; Design streaming architectures with Apache Kafka; Ensure data integrity.",
                Requirements = "4-7 years backend engineering; Strong understanding of concurrency, memory management, and distributed systems; Experience with SQL Server or PostgreSQL.",
                Skills = "C#, .NET Core, Distributed Systems, Kafka, Redis, SQL Server, Docker",
                ExperienceLevel = "Senior",
                SalaryMin = 2000000,
                SalaryMax = 3200000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Hyderabad, Telangana",
                Benefits = "Free gourmet meals at office, Comprehensive family insurance, Wellness allowance",
                ApplicationDeadline = DateTime.UtcNow.AddDays(28),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new Job
            {
                CompanyId = company2.Id,
                Title = "UI/UX Product Designer",
                Description = "Shape how thousands of businesses interact with CloudWave. We need a designer who cares deeply about typography, micro-interactions, and simplifying complex data workflows.",
                Responsibilities = "Conduct user research and usability testing; Build interactive prototypes in Figma; Partner closely with engineers to ensure pixel-perfect execution.",
                Requirements = "3+ years UX/UI design experience for B2B SaaS products; Strong portfolio showcasing data-rich interfaces; Understanding of HTML/CSS constraints.",
                Skills = "UI/UX Design, Figma, User Research, Wireframing, Design Systems, Prototyping",
                ExperienceLevel = "Mid",
                SalaryMin = 1200000,
                SalaryMax = 1800000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Hyderabad, Telangana",
                Benefits = "MacBook Pro provided, Creative software stipend, Ergonomic workstation setup",
                ApplicationDeadline = DateTime.UtcNow.AddDays(20),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            },
            new Job
            {
                CompanyId = company3.Id,
                Title = "Lead Database Administrator (SQL Server)",
                Description = "FinScale is hiring a seasoned DBA to manage mission-critical transactional SQL Server databases supporting high-value financial settlements.",
                Responsibilities = "Monitor query performance, index fragmentation, and database deadlocks; Manage Always On Availability Groups, failovers, and backup strategies.",
                Requirements = "6+ years managing high-load Microsoft SQL Server environments; Deep knowledge of T-SQL, query execution plans, and transaction isolation levels.",
                Skills = "SQL Server, T-SQL, Database Administration, Performance Tuning, High Availability, Disaster Recovery",
                ExperienceLevel = "Senior",
                SalaryMin = 2200000,
                SalaryMax = 3500000,
                EmploymentType = "FullTime",
                WorkplaceType = "Onsite",
                Location = "Mumbai, Maharashtra",
                Benefits = "Performance-linked bonus up to 25%, Premium private health cover, Relocation assistance",
                ApplicationDeadline = DateTime.UtcNow.AddDays(40),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-14)
            },
            new Job
            {
                CompanyId = company3.Id,
                Title = "Quantitative Data Analyst",
                Description = "Analyze financial time-series data, market liquidity, and trade execution metrics to provide actionable insights to algorithmic trading desks.",
                Responsibilities = "Build automated reporting pipelines; Construct risk attribution models; Create executive BI dashboards using PowerBI and Python.",
                Requirements = "3-5 years data analysis experience in finance or fintech; Strong SQL, Python (pandas/numpy), and statistical analysis skills.",
                Skills = "Data Analysis, SQL, Python, PowerBI, Financial Modeling, Statistics",
                ExperienceLevel = "Mid",
                SalaryMin = 1500000,
                SalaryMax = 2400000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Mumbai, Maharashtra",
                Benefits = "Annual financial sector bonus, Health & life insurance, Gym membership reimbursement",
                ApplicationDeadline = DateTime.UtcNow.AddDays(25),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-9)
            },
            new Job
            {
                CompanyId = company3.Id,
                Title = "Software Engineer - Payments Gateway (.NET / C#)",
                Description = "Design and build secure, compliant payment processing integrations supporting UPI, credit rails, and international remittances.",
                Responsibilities = "Implement PCI-DSS compliant API endpoints; Build automated idempotency, reconciliation, and retry mechanisms for transaction failures.",
                Requirements = "2-5 years experience building secure backend services in C# / .NET Core; Familiarity with financial transactions and payment gateway integrations.",
                Skills = ".NET Core, C#, Web API, SQL Server, Payment Gateways, Security, Encryption",
                ExperienceLevel = "Mid",
                SalaryMin = 1300000,
                SalaryMax = 2000000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Mumbai, Maharashtra",
                Benefits = "Health insurance for self and family, Provident fund matching, Skill development stipend",
                ApplicationDeadline = DateTime.UtcNow.AddDays(30),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new Job
            {
                CompanyId = company4.Id,
                Title = "React Native / Mobile Developer",
                Description = "Malabar Digital is looking for a skilled Mobile Developer to craft cross-platform iOS and Android apps with smooth 60fps animations.",
                Responsibilities = "Develop feature-rich mobile applications using React Native and TypeScript; Integrate native modules and push notifications; Deploy to App Store & Google Play.",
                Requirements = "2-4 years mobile development with React Native; Knowledge of state management (Zustand/Redux), offline storage, and REST API integration.",
                Skills = "React Native, TypeScript, Mobile Development, iOS, Android, REST APIs",
                ExperienceLevel = "Mid",
                SalaryMin = 800000,
                SalaryMax = 1500000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Kochi, Kerala",
                Benefits = "Scenic Infopark campus, Flexible Friday work hours, Medical insurance",
                ApplicationDeadline = DateTime.UtcNow.AddDays(20),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new Job
            {
                CompanyId = company4.Id,
                Title = "Junior Web Developer (.NET & React)",
                Description = "An exciting opportunity for enthusiastic freshers and junior developers to join a high-growth software engineering team in Kochi.",
                Responsibilities = "Assist in implementing UI components in React; Write basic CRUD APIs in ASP.NET Core; Participate in code reviews and test automation.",
                Requirements = "0-2 years experience or strong academic project portfolio in C# / JavaScript / React; Eagerness to learn clean coding practices.",
                Skills = "C#, JavaScript, React, ASP.NET Core, SQL Server, HTML, CSS",
                ExperienceLevel = "Entry",
                SalaryMin = 450000,
                SalaryMax = 750000,
                EmploymentType = "FullTime",
                WorkplaceType = "Onsite",
                Location = "Kochi, Kerala",
                Benefits = "Structured mentorship program, Free snacks and coffee, Fast-track career growth",
                ApplicationDeadline = DateTime.UtcNow.AddDays(15),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            },
            new Job
            {
                CompanyId = company1.Id,
                Title = "Associate Quality Assurance (QA) Automation Engineer",
                Description = "Help maintain our software quality bar by building automated test suites for Web APIs and React applications using Playwright and C#.",
                Responsibilities = "Write automated API tests, regression suites, and UI automation; Integrate tests into GitHub Actions CI pipelines; Report reproducible defects.",
                Requirements = "2-4 years in QA automation; Proficiency in C# / JavaScript and testing frameworks like Selenium or Playwright; Experience testing REST APIs.",
                Skills = "QA Automation, Playwright, Selenium, C#, API Testing, CI/CD",
                ExperienceLevel = "Mid",
                SalaryMin = 900000,
                SalaryMax = 1500000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Bangalore, Karnataka",
                Benefits = "Medical insurance, Certification sponsorship, Hybrid schedule (2 days office)",
                ApplicationDeadline = DateTime.UtcNow.AddDays(30),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Job
            {
                CompanyId = company2.Id,
                Title = "Cloud Solutions Architect - Azure",
                Description = "Engage with enterprise customers to design multi-tier cloud architectures, disaster recovery plans, and zero-trust security postures on Microsoft Azure.",
                Responsibilities = "Author architectural design documents; Guide migration of on-prem workloads to Azure PaaS; Optimize cloud expenditure and resource tagging.",
                Requirements = "8+ years in IT architecture; Certified Azure Solutions Architect Expert; Deep experience in networking, security, and identity federation.",
                Skills = "Azure, Cloud Architecture, Microservices, Security, Disaster Recovery, Networking",
                ExperienceLevel = "Lead",
                SalaryMin = 3200000,
                SalaryMax = 4800000,
                EmploymentType = "FullTime",
                WorkplaceType = "Remote",
                Location = "Remote, India",
                Benefits = "Work from anywhere, Stock options, Premium health insurance for parents",
                ApplicationDeadline = DateTime.UtcNow.AddDays(45),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-11)
            },
            new Job
            {
                CompanyId = company3.Id,
                Title = "Cybersecurity Analyst & Compliance Specialist",
                Description = "Protect FinScale's core trading infrastructure against cyber threats and ensure regulatory compliance with RBI and SEBI financial standards.",
                Responsibilities = "Conduct vulnerability assessments and penetration testing; Monitor SOC telemetry for anomalies; Maintain ISO 27001 and SOC2 certifications.",
                Requirements = "3-6 years in cybersecurity; Certifications such as CISSP, CEH, or CISA; Strong understanding of network protocols, firewalls, and encryption.",
                Skills = "Cybersecurity, Penetration Testing, SOC2, Network Security, SIEM, Risk Assessment",
                ExperienceLevel = "Mid",
                SalaryMin = 1600000,
                SalaryMax = 2500000,
                EmploymentType = "FullTime",
                WorkplaceType = "Onsite",
                Location = "Mumbai, Maharashtra",
                Benefits = "Competitive compensation, Full corporate medical coverage, Transportation allowance",
                ApplicationDeadline = DateTime.UtcNow.AddDays(25),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-13)
            },
            new Job
            {
                CompanyId = company4.Id,
                Title = "PHP / Laravel to .NET Migration Specialist",
                Description = "Lead the architectural modernization of legacy web services from PHP to modern ASP.NET Core 8 Web API with SQL Server.",
                Responsibilities = "Map legacy database schemas to EF Core models; Rewrite API routes with rigorous test coverage; Ensure zero data loss during cutover.",
                Requirements = "4+ years combined experience in PHP/Laravel and C# .NET Core; Strong SQL relational database design skills.",
                Skills = ".NET Core, C#, PHP, Laravel, SQL Server, Database Migration",
                ExperienceLevel = "Mid",
                SalaryMin = 1000000,
                SalaryMax = 1600000,
                EmploymentType = "Contract",
                WorkplaceType = "Remote",
                Location = "Remote, India",
                Benefits = "Competitive contractor day rate, Possibility of permanent conversion",
                ApplicationDeadline = DateTime.UtcNow.AddDays(20),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Job
            {
                CompanyId = company1.Id,
                Title = "Product Manager - Developer Platform",
                Description = "Drive the product vision and developer experience for TechCorp's internal and external API platforms, documentation, and SDKs.",
                Responsibilities = "Define feature requirements and product backlogs; Collaborate with engineering leads; Conduct user interviews with enterprise developers.",
                Requirements = "4+ years technical product management experience; Technical background (computer science degree or prior software engineering role).",
                Skills = "Product Management, Agile, API Design, Jira, Roadmapping, Stakeholder Management",
                ExperienceLevel = "Mid",
                SalaryMin = 2000000,
                SalaryMax = 3000000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Bangalore, Karnataka",
                Benefits = "Annual executive retreats, Generous stock options, Relocation bonus",
                ApplicationDeadline = DateTime.UtcNow.AddDays(40),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new Job
            {
                CompanyId = company2.Id,
                Title = "Machine Learning Engineer - NLP & Search",
                Description = "Develop vector search embeddings, semantic query expansion, and generative AI features for our multi-lingual customer intelligence SaaS platform.",
                Responsibilities = "Fine-tune transformer models; Deploy model inference endpoints with low latency; Implement hybrid keyword + vector retrieval in SQL & Pinecone.",
                Requirements = "3-6 years hands-on ML engineering; Strong Python proficiency, PyTorch/TensorFlow, Hugging Face transformers, and vector databases.",
                Skills = "Python, Machine Learning, NLP, PyTorch, Vector Search, LLMs, Docker",
                ExperienceLevel = "Senior",
                SalaryMin = 2400000,
                SalaryMax = 3800000,
                EmploymentType = "FullTime",
                WorkplaceType = "Remote",
                Location = "Remote, India",
                Benefits = "Cutting-edge GPU cloud credits, Conference attendance travel grant, High-spec hardware",
                ApplicationDeadline = DateTime.UtcNow.AddDays(35),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new Job
            {
                CompanyId = company3.Id,
                Title = "Operations & HR Business Partner",
                Description = "Oversee talent acquisition, performance review cycles, employee engagement, and operational compliance at FinScale Mumbai.",
                Responsibilities = "Lead recruitment drives across engineering and trading teams; Implement onboarding workflows; Manage compensation benchmarking.",
                Requirements = "4+ years HR generalist or HRBP experience in high-growth tech or financial institutions; Strong communication and negotiation skills.",
                Skills = "Human Resources, Talent Acquisition, Employee Relations, HRBP, Compensation & Benefits",
                ExperienceLevel = "Mid",
                SalaryMin = 1100000,
                SalaryMax = 1700000,
                EmploymentType = "FullTime",
                WorkplaceType = "Onsite",
                Location = "Mumbai, Maharashtra",
                Benefits = "Annual festival bonus, Comprehensive family health care, Casual dress code",
                ApplicationDeadline = DateTime.UtcNow.AddDays(25),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            },
            new Job
            {
                CompanyId = company4.Id,
                Title = "Senior Graphic & Motion Designer",
                Description = "Create visual storytelling assets, landing page graphics, social motion clips, and digital brand illustrations for international web campaigns.",
                Responsibilities = "Create 2D animations in After Effects; Design vector illustrations and marketing banners; Maintain cohesive visual identity.",
                Requirements = "3+ years motion and graphic design experience; Adobe Creative Suite (After Effects, Illustrator, Photoshop) mastery.",
                Skills = "Motion Design, After Effects, Graphic Design, Illustrator, Animation, Branding",
                ExperienceLevel = "Mid",
                SalaryMin = 750000,
                SalaryMax = 1300000,
                EmploymentType = "FullTime",
                WorkplaceType = "Hybrid",
                Location = "Kochi, Kerala",
                Benefits = "High-end dual-monitor setup, Wacom tablet allowance, Creative work culture",
                ApplicationDeadline = DateTime.UtcNow.AddDays(18),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new Job
            {
                CompanyId = company1.Id,
                Title = "Software Engineering Intern (.NET & React)",
                Description = "Kickstart your software engineering career with hands-on exposure to production cloud architectures, pair programming, and agile rituals at TechCorp.",
                Responsibilities = "Work with senior mentors to build UI widgets in React and REST API endpoints in ASP.NET Core; Write unit tests and participate in standups.",
                Requirements = "Pre-final or final year student in B.Tech / MCA; Strong grasp of data structures, OOP principles, and JavaScript / C# fundamentals.",
                Skills = "C#, JavaScript, React, SQL, Problem Solving, Data Structures",
                ExperienceLevel = "Entry",
                SalaryMin = 300000,
                SalaryMax = 450000,
                EmploymentType = "Internship",
                WorkplaceType = "Hybrid",
                Location = "Bangalore, Karnataka",
                Benefits = "Monthly stipend ₹35,000, Pre-Placement Offer (PPO) opportunity, Free lunch",
                ApplicationDeadline = DateTime.UtcNow.AddDays(15),
                Status = "Active",
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        context.Jobs.AddRange(jobs);
        await context.SaveChangesAsync();

        // 6. Seed Applications
        var job1 = jobs[0]; // .NET Core Web API at TechCorp
        var job2 = jobs[1]; // Full Stack React & .NET at TechCorp
        var job4 = jobs[3]; // Frontend Architect at CloudWave
        var job8 = jobs[7]; // Quantitative Data Analyst at FinScale

        var app1 = new Application
        {
            JobId = job1.Id,
            JobSeekerProfileId = profile1.Id,
            ResumeUrl = profile1.ResumeUrl,
            CoverLetter = "Dear TechCorp hiring team,\n\nI have over 5 years of hands-on experience architecting high-performance .NET Core microservices and relational SQL Server databases. I am excited by TechCorp's mission and confident my background aligns directly with your senior requirements.\n\nSincerely,\nRahul Sharma",
            Status = "Interview",
            AppliedAt = DateTime.UtcNow.AddDays(-12)
        };

        var app2 = new Application
        {
            JobId = job2.Id,
            JobSeekerProfileId = profile1.Id,
            ResumeUrl = profile1.ResumeUrl,
            CoverLetter = "Hello,\n\nI would love to contribute across both frontend React and backend C# Web API layers at TechCorp.",
            Status = "Shortlisted",
            AppliedAt = DateTime.UtcNow.AddDays(-8)
        };

        var app3 = new Application
        {
            JobId = job4.Id,
            JobSeekerProfileId = profile3.Id,
            ResumeUrl = profile3.ResumeUrl,
            CoverLetter = "Dear CloudWave team,\n\nAs a product designer with front-end prototyping expertise, I specialize in design systems and accessible interface design.",
            Status = "Under Review",
            AppliedAt = DateTime.UtcNow.AddDays(-5)
        };

        var app4 = new Application
        {
            JobId = job8.Id,
            JobSeekerProfileId = profile2.Id,
            ResumeUrl = profile2.ResumeUrl,
            CoverLetter = "Dear FinScale team,\n\nI have 4 years of deep quantitative experience modeling financial series and crafting PowerBI and SQL analytics.",
            Status = "Selected",
            AppliedAt = DateTime.UtcNow.AddDays(-14)
        };

        context.Applications.AddRange(app1, app2, app3, app4);
        await context.SaveChangesAsync();

        // 7. Seed Status History
        context.ApplicationStatusHistories.AddRange(
            new ApplicationStatusHistory
            {
                ApplicationId = app1.Id,
                Status = "Applied",
                Comment = "Application submitted via JobPortal",
                ChangedBy = "Rahul Sharma",
                CreatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new ApplicationStatusHistory
            {
                ApplicationId = app1.Id,
                Status = "Under Review",
                Comment = "Profile passed initial screening",
                ChangedBy = "Arun Verma (TechCorp)",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new ApplicationStatusHistory
            {
                ApplicationId = app1.Id,
                Status = "Shortlisted",
                Comment = "Strong technical match for C# and SQL Server",
                ChangedBy = "Arun Verma (TechCorp)",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new ApplicationStatusHistory
            {
                ApplicationId = app1.Id,
                Status = "Interview",
                Comment = "Technical round scheduled with Tech Lead",
                ChangedBy = "Arun Verma (TechCorp)",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new ApplicationStatusHistory
            {
                ApplicationId = app4.Id,
                Status = "Applied",
                Comment = "Applied",
                ChangedBy = "Priya Patel",
                CreatedAt = DateTime.UtcNow.AddDays(-14)
            },
            new ApplicationStatusHistory
            {
                ApplicationId = app4.Id,
                Status = "Selected",
                Comment = "Candidate offered position after final evaluation round",
                ChangedBy = "Rohan Mehta (FinScale)",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        );

        // 8. Seed Scheduled Interview
        var interview1 = new Interview
        {
            ApplicationId = app1.Id,
            InterviewDate = DateTime.UtcNow.AddDays(2).Date,
            InterviewTime = "02:30 PM IST",
            InterviewType = "Online",
            MeetingLink = "https://meet.google.com/xyz-tech-corp",
            Notes = "Technical assessment covering ASP.NET Core 8 internals, EF Core query optimization, and architectural problem solving.",
            Status = "Scheduled",
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };
        context.Interviews.Add(interview1);

        // 9. Seed Saved Jobs
        context.SavedJobs.AddRange(
            new SavedJob { JobId = jobs[2].Id, JobSeekerProfileId = profile1.Id, CreatedAt = DateTime.UtcNow.AddDays(-4) },
            new SavedJob { JobId = jobs[3].Id, JobSeekerProfileId = profile1.Id, CreatedAt = DateTime.UtcNow.AddDays(-2) },
            new SavedJob { JobId = jobs[6].Id, JobSeekerProfileId = profile2.Id, CreatedAt = DateTime.UtcNow.AddDays(-3) },
            new SavedJob { JobId = jobs[5].Id, JobSeekerProfileId = profile3.Id, CreatedAt = DateTime.UtcNow.AddDays(-1) }
        );

        // 10. Seed Notifications
        context.Notifications.AddRange(
            new Notification
            {
                UserId = seeker1.Id,
                Title = "Interview Scheduled!",
                Message = "TechCorp Solutions has scheduled your technical interview for Senior .NET Core Web API Developer on " + DateTime.UtcNow.AddDays(2).ToString("dd MMM yyyy") + " at 02:30 PM IST.",
                Type = "Interview",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Notification
            {
                UserId = seeker1.Id,
                Title = "Application Shortlisted",
                Message = "Great news! Your application for Full Stack React & .NET Engineer at TechCorp Solutions has been shortlisted.",
                Type = "Status",
                IsRead = true,
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            },
            new Notification
            {
                UserId = employer1.Id,
                Title = "New Candidate Application",
                Message = "Rahul Sharma submitted an application for Senior .NET Core Web API Developer.",
                Type = "Application",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new Notification
            {
                UserId = seeker2.Id,
                Title = "Offer Extended 🎉",
                Message = "Congratulations! FinScale Systems has selected you for the Quantitative Data Analyst position.",
                Type = "Status",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        );

        await context.SaveChangesAsync();
    }
}
