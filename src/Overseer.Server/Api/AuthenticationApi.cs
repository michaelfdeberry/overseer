using Microsoft.AspNetCore.Mvc;
using Overseer.Models;
using System.Net;
using System.Security.Claims;

namespace Overseer.Server.Api
{
    public static class AuthenticationApi
    {
        public static RouteGroupBuilder MapAuthenticationApi(this RouteGroupBuilder builder)
        {
            var group = builder.MapGroup("/auth");

            group.MapGet("/", (ClaimsPrincipal? currentUser, IAuthorizationManager authorizationManager) =>
            {
                var isAuthenticated = currentUser?.Identity?.IsAuthenticated ?? false;
                if (isAuthenticated) return Results.Ok();

                return Results.Text($"requiresInitialization={authorizationManager.RequiresAuthorization()}", statusCode: (int)HttpStatusCode.Unauthorized);
            });

            group.MapPut("/setup", (UserDisplay user, IAuthorizationManager authorizationManager, IUserManager userManager) =>
            {
                if (!authorizationManager.RequiresAuthorization()) return Results.StatusCode((int)HttpStatusCode.PreconditionFailed);
                return Results.Ok(userManager.CreateUser(user));
            });

            group.MapPost("/login", (UserDisplay user, IAuthenticationManager authenticationManager) => Results.Ok(authenticationManager.AuthenticateUser(user)));

            group.MapDelete("/logout", ([FromHeader(Name = "Authorization")] string authorization, IAuthenticationManager authenticationManager) =>
            {
                authenticationManager.DeauthenticateUser(authorization);
                return Results.Ok();
            })
                .RequireAuthorization();

            group.MapPost("/logout{id}", (int id, IAuthenticationManager authenticationManager) => Results.Ok(authenticationManager.DeauthenticateUser(id)))
                .RequireAuthorization(AccessLevel.Administrator.ToString());

            group.MapGet("/sso/{id}", (int id, IAuthenticationManager authenticationManager) => Results.Ok(authenticationManager.GetPreauthenticatedToken(id)))
                .RequireAuthorization(AccessLevel.Administrator.ToString());

            group.MapPost("/sso", (string token, IAuthenticationManager authenticationManager) => Results.Ok(authenticationManager.ValidatePreauthenticatedToken(token)));

            return builder;
        }
    }
}
