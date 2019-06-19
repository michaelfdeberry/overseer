using Nancy;
using Nancy.Extensions;
using Nancy.ModelBinding;
using Nancy.Security;
using Overseer.Models;
using System.Linq;

namespace Overseer.Daemon.Modules
{
    public class AuthenticationModule : NancyModule
    {
        public AuthenticationModule(IAuthenticationManager authenticationManager)
            : base("auth")
        {
            Post("/login", p => authenticationManager.AuthenticateUser(this.Bind<UserDisplay>()));

            Delete("/logout", p =>
            {
                this.RequiresAuthentication();

                authenticationManager.DeauthenticateUser(Request.Headers["Authorization"].FirstOrDefault());
                return HttpStatusCode.OK;
            });

            Post("/logout/{id:int}", p =>
            {
                this.RequiresAdmin();

                return authenticationManager.DeauthenticateUser((int)p.id);
            });

            Get("/sso/{id:int}", p =>
            {
                this.RequiresAdmin();

                return authenticationManager.GetPreauthenticatedToken((int)p.id);
            });

            Post("/sso", p => 
            {
                return authenticationManager.ValidatePreauthenticatedToken(Request.Body.AsString());
            });
        }
    }
}
