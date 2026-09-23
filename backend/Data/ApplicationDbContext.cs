using Microsoft.EntityFrameworkCore;
using JobPortal.API.Entities;

namespace JobPortal.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<JobSeekerProfile> JobSeekerProfiles => Set<JobSeekerProfile>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.Property(u => u.Role).HasMaxLength(50).IsRequired();
        });

        // JobSeekerProfile
        modelBuilder.Entity<JobSeekerProfile>(entity =>
        {
            entity.HasOne(p => p.User)
                  .WithOne(u => u.JobSeekerProfile)
                  .HasForeignKey<JobSeekerProfile>(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Company
        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasOne(c => c.User)
                  .WithOne(u => u.Company)
                  .HasForeignKey<Company>(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(c => c.CompanyName).HasMaxLength(200).IsRequired();
        });

        // Job
        modelBuilder.Entity<Job>(entity =>
        {
            entity.HasOne(j => j.Company)
                  .WithMany(c => c.Jobs)
                  .HasForeignKey(j => j.CompanyId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(j => j.Title).HasMaxLength(200).IsRequired();
            entity.Property(j => j.SalaryMin).HasPrecision(18, 2);
            entity.Property(j => j.SalaryMax).HasPrecision(18, 2);

            entity.HasIndex(j => j.Title);
            entity.HasIndex(j => j.Location);
            entity.HasIndex(j => j.Status);
        });

        // Application
        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasOne(a => a.Job)
                  .WithMany(j => j.Applications)
                  .HasForeignKey(a => a.JobId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.JobSeekerProfile)
                  .WithMany(p => p.Applications)
                  .HasForeignKey(a => a.JobSeekerProfileId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate applications for the same job by the same job seeker
            entity.HasIndex(a => new { a.JobId, a.JobSeekerProfileId }).IsUnique();
        });

        // ApplicationStatusHistory
        modelBuilder.Entity<ApplicationStatusHistory>(entity =>
        {
            entity.HasOne(h => h.Application)
                  .WithMany(a => a.StatusHistories)
                  .HasForeignKey(h => h.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SavedJob
        modelBuilder.Entity<SavedJob>(entity =>
        {
            entity.HasOne(s => s.Job)
                  .WithMany(j => j.SavedJobs)
                  .HasForeignKey(s => s.JobId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.JobSeekerProfile)
                  .WithMany(p => p.SavedJobs)
                  .HasForeignKey(s => s.JobSeekerProfileId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Unique saved job per seeker
            entity.HasIndex(s => new { s.JobId, s.JobSeekerProfileId }).IsUnique();
        });

        // Interview
        modelBuilder.Entity<Interview>(entity =>
        {
            entity.HasOne(i => i.Application)
                  .WithMany(a => a.Interviews)
                  .HasForeignKey(i => i.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Notification
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
