using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;
using Overseer.Core;
using Overseer.Core.Data;
using Owin;
using System;
using System.Security.Principal;
using System.Threading.Tasks;

namespace Overseer.Startup
{
    public class OverseerAuthenticationOptions : AuthenticationOptions
    {
        public OverseerAuthenticationOptions() 
            : base("default")
        {
            AuthenticationMode = AuthenticationMode.Active;
        }
    }

    public class OverseerAuthenticationHandler : AuthenticationHandler<OverseerAuthenticationOptions>
    {
        protected override Task<AuthenticationTicket> AuthenticateCoreAsync()
        {
            var dataContext = OverseerBootstrapper.Container.Resolve<IDataContext>();
            var userManager = OverseerBootstrapper.Container.Resolve<UserManager>();

            var settings = dataContext.GetApplicationSettings();            
            if (!settings.RequiresAuthentication)
            {
                return Task.FromResult(new AuthenticationTicket(new GenericIdentity("Anonymous", "User"), null));
            }

            var token = Context.Request.Headers["Authorization"];
            var user = userManager.AuthenticateToken(token);
            if (user != null)
            {
                return Task.FromResult(new AuthenticationTicket(new GenericIdentity(user.Username, "User"), null));
            }

            return Task.FromResult<AuthenticationTicket>(null);
        }
    }

    public class OverseerAuthenticationMiddleware : AuthenticationMiddleware<OverseerAuthenticationOptions>
    {
        public OverseerAuthenticationMiddleware(OwinMiddleware next, OverseerAuthenticationOptions options) 
            : base(next, options)
        {
        }

        protected override AuthenticationHandler<OverseerAuthenticationOptions> CreateHandler()
        {
            return new OverseerAuthenticationHandler();
        }
    }

    public static class AuthenticationExtensions
    {
        public static IAppBuilder UseOverseerAuthentication(this IAppBuilder app)
        {
            if(app == null) throw new ArgumentException(nameof(app));

            var options = new OverseerAuthenticationOptions();
            return app.Use<OverseerAuthenticationMiddleware>(options);
        }
    }
}
