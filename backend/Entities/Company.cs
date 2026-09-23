namespace JobPortal.API.Entities;

public class Company
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public string? CompanySize { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? Location { get; set; }
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}
