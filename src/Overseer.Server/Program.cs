using Microsoft.AspNetCore.SpaServices.AngularCli;
using Overseer.Data;
using Overseer.Models;
using Overseer.Server;
using Overseer.Server.Api;
using Overseer.Server.Hubs;
using System.CommandLine;


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
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("Readonly", policy => policy.RequireRole(AccessLevel.Readonly.ToString()));
        options.AddPolicy("Administrator", policy => policy.RequireRole(AccessLevel.Administrator.ToString()));
    });
    
    var app = builder.Build();
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.MapOverseerApi();
    app.MapHub<StatusHub>("/status");
    app.UseSpa(spa =>
    {
        if (app.Environment.IsDevelopment())
        {
            spa.Options.SourcePath = "../Overseer.Client";
            spa.UseAngularCliServer(npmScript: "start");
        }
        else
        {
            spa.Options.SourcePath = "/Overseer.Client";
        }
    });

    app.HandleOverseerExceptions();

    app.Run();
}