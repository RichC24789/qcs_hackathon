using qcs.hackathon.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<ITopicContentService, TopicContentService>();

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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("HackathonFrontend");
app.UseHttpsRedirection();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/openapi/v1.json"));

app.Run();
