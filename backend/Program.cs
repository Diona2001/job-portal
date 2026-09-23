using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using JobPortal.API.Configuration;
using JobPortal.API.Data;
using JobPortal.API.Helpers;
using JobPortal.API.Middleware;
using JobPortal.API.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddHttpContextAccessor();

// 2. Configure JWT Settings
var jwtSettingsSection = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettingsSection);
var jwtSettings = jwtSettingsSection.Get<JwtSettings>() ?? new JwtSettings();
var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

// 3. Add Authentication & JWT Bearer
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. Configure Database (SQL Server by default, with auto-fallback to SQLite when SQL Server is offline)
var provider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "Auto";
var sqlServerConn = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
var sqliteConn = builder.Configuration.GetConnectionString("SqliteConnection") ?? "Data Source=jobportal.db";

bool useSqlServer = false;
if (!provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
{
    try
    {
        using var testConn = new SqlConnection(sqlServerConn);
        testConn.Open();
        useSqlServer = true;
    }
    catch
    {
        useSqlServer = false;
    }
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (useSqlServer)
    {
        options.UseSqlServer(sqlServerConn);
    }
    else
    {
        options.UseSqlite(sqliteConn);
    }
});

// 5. Register Application Services
builder.Services.AddScoped<IJwtHelper, JwtHelper>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISavedJobService, SavedJobService>();
builder.Services.AddScoped<IInterviewService, InterviewService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// 6. Configure CORS for React frontend (dynamically supports any localhost port, e.g., 5173, 5174, etc.)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrEmpty(origin)) return false;
                  try
                  {
                      var uri = new Uri(origin);
                      return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || 
                             uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);
                  }
                  catch
                  {
                      return false;
                  }
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 7. Configure Swagger with JWT Auth Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Job Portal API",
        Version = "v1",
        Description = "ASP.NET Core 8 Web API for Job Portal web application with Role-Based Access Control (Admin, Employer, JobSeeker)."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by your JWT token"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 8. Auto-create and Seed Database at startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
        await DbInitializer.SeedDataAsync(context);
        logger.LogInformation("Database initialized and seeded with 20+ jobs, companies, users, and applications.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error initializing or seeding the database: {Message}", ex.Message);
    }
}

// 9. Middleware Pipeline
app.UseCors("AllowFrontend");

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Job Portal API v1");
        c.RoutePrefix = "swagger";
    });
}

// Enable Static Files for uploaded resumes, avatars, and logos
app.UseStaticFiles();

app.UseRouting();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
