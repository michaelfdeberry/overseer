using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;
using Owin;
using System;
using System.Threading.Tasks;

namespace Overseer.Daemon.Startup
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
            var userManager = OverseerBootstrapper.Container.Resolve<UserManager>();

            var identity = userManager.Authenticate(Context.Request.Headers["Authorization"]);
            if (identity == null)
                return Task.FromResult<AuthenticationTicket>(null);

            return Task.FromResult(new AuthenticationTicket(identity, null));
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
