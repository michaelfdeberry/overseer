using Nancy;
using Nancy.ModelBinding;
using Nancy.Responses;
using Nancy.Security;
using Overseer.Models;
using System.Linq;

namespace Overseer.Daemon.Modules
{
    public class AuthenticationModule : NancyModule
    {
        public AuthenticationModule(UserManager userManager)
            : base("auth")
        {
            Get("/", p =>
            {
                if (Context.CurrentUser.IsAuthenticated()) return HttpStatusCode.OK;

                return new TextResponse(HttpStatusCode.Unauthorized, $"requiresInitialization={userManager.RequiresInitialSetup()}");
            });

            Post("/login", p => userManager.AuthenticateUser(this.Bind<UserDisplay>()));

            Delete("/logout", p =>
            {
                this.RequiresMSOwinAuthentication();

                userManager.DeauthenticateUser(Request.Headers["Authorization"].FirstOrDefault());
                return HttpStatusCode.OK;
            });

            Post("/logout/{id:int}", p =>
            {
                this.RequiresMSOwinAuthentication();

                return userManager.DeauthenticateUser((int)p.id);
            });

            Put("/setup", p =>
            {
                if (!userManager.RequiresInitialSetup())
                {
                    return HttpStatusCode.PreconditionFailed;
                }

                return userManager.CreateUser(this.Bind<UserDisplay>());
            });
        }
    }
}
