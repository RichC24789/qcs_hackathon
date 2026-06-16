namespace qcs.hackathon.Api.Data.Entities;

public sealed class User
{
    public int Id { get; set; }

    public required string Email { get; set; }

    public required string DisplayName { get; set; }

    public DateTime CreatedAt { get; set; }
}
