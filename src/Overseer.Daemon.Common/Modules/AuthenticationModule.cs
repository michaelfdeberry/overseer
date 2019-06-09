using Nancy;
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
        }
    }
}
