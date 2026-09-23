namespace JobPortal.API.Configuration;

public class JwtSettings
{
    public string SecretKey { get; set; } = "JobPortalSuperSecretKeyWithAtLeast32BytesLength!";
    public string Issuer { get; set; } = "JobPortalAPI";
    public string Audience { get; set; } = "JobPortalClients";
    public int ExpiryDays { get; set; } = 7;
}
