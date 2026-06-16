using Microsoft.EntityFrameworkCore;
using qcs.hackathon.Api.Data;
using qcs.hackathon.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<HackathonDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Hackathon")));

builder.Services.AddSingleton<ITopicContentService, TopicContentService>();
builder.Services.AddScoped<IUserIdentityService, UserIdentityService>();
builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
builder.Services.AddScoped<ITopicLikeService, TopicLikeService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("HackathonFrontend", policy =>
    {
        policy
            .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HackathonDbContext>();
    await DatabaseSeeder.InitializeAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("HackathonFrontend");
app.UseHttpsRedirection();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/openapi/v1.json"));

app.Run();
