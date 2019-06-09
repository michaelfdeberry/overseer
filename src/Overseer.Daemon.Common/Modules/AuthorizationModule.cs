using Nancy;
using Nancy.ModelBinding;
using Nancy.Responses;
using Overseer.Models;

namespace Overseer.Daemon.Modules
{
    public class AuthorizationModule : NancyModule
    {
        public AuthorizationModule(IAuthorizationManager authorizationManager, IUserManager userManager)
            : base("auth")
        {
            Get("/", p =>
            {
                var currentUser = Context.CurrentUser;
                if (currentUser != null && currentUser.Identity.IsAuthenticated) return HttpStatusCode.OK;

                return new TextResponse(HttpStatusCode.Unauthorized, $"requiresInitialization={authorizationManager.RequiresAuthorization()}");
            });
            
            Put("/setup", p =>
            {
                if (!authorizationManager.RequiresAuthorization())
                {
                    return HttpStatusCode.PreconditionFailed;
                }

                return userManager.CreateUser(this.Bind<UserDisplay>());
            });

        }
    }
}
