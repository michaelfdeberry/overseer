using System.CommandLine;

using log4net.Config;

using Microsoft.Extensions.FileProviders;

using Overseer.Data;
using Overseer.Models;
using Overseer.Server;
using Overseer.Server.Api;
using Overseer.Server.Hubs;

using (var context = new LiteDataContext())
{
    var values = context.GetValueStore();
    var settings = values.GetOrPut(() => new ApplicationSettings());
    var portOption = new Option<int?>(name: "--port", description: "The Overseer Server Port");
    var intervalOption = new Option<int?>(name: "--interval", description: "How often Overseer will poll for updates.");
    var options = new RootCommand("Overseer CLI Options...");
    var parseResults = options.Parse(args);
    settings.LocalPort = parseResults.GetValueForOption(portOption) ?? ApplicationSettings.DefaultPort;
    settings.Interval = parseResults.GetValueForOption(intervalOption) ?? ApplicationSettings.DefaultInterval;

    var builder = WebApplication.CreateBuilder(args);
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddSignalR();
    builder.Services.AddOverseerDependencies(context);
    builder.Services
        .AddAuthentication(OverseerAuthenticationOptions.Setup)
        .UseOverseerAuthentication();

    builder.Services.AddAuthorizationBuilder()
        .AddPolicy("Readonly", policy => policy.RequireRole(AccessLevel.Readonly.ToString()))
        .AddPolicy("Administrator", policy => policy.RequireRole(AccessLevel.Administrator.ToString()));

    var app = builder.Build();

    XmlConfigurator.Configure(new FileInfo(Path.Combine(app.Environment.ContentRootPath, "log4net.config")));
    var isDev = app.Environment.IsDevelopment();

    if (isDev)
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseCors((builder) => builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowedToAllowWildcardSubdomains());
    }

    app.HandleOverseerExceptions();
    app.MapOverseerApi();
    app.MapHub<StatusHub>("/push/status");
    app.LinkMonitorToStatusHub();

    if (!isDev)
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "browser"))
        });

        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = "/browser";
            spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(app.Environment.ContentRootPath, "browser")),
            };
        });

        app.Run($"http://*:{settings.LocalPort}");
    }
    else
    {
        app.Run();
    }
}