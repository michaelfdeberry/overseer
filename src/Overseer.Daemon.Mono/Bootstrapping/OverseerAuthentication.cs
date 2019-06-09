using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;
using Nancy.TinyIoc;
using Owin;
using System;
using System.Threading.Tasks;

namespace Overseer.Daemon.Bootstrapping
{
    public class OverseerAuthenticationOptions : AuthenticationOptions
    {
        public OverseerAuthenticationOptions() 
            : base("default")
        {
            AuthenticationMode = AuthenticationMode.Active;
        }

        public TinyIoCContainer Container { get; set; }
    }

    public class OverseerAuthenticationHandler : AuthenticationHandler<OverseerAuthenticationOptions>
    {
        protected override Task<AuthenticationTicket> AuthenticateCoreAsync()
        {            
            var authorizationManager = Options.Container.Resolve<IAuthorizationManager>();
            var identity = authorizationManager.Authorize(Context.Request.Headers["Authorization"]);
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
        public static IAppBuilder UseOverseerAuthentication(this IAppBuilder app, TinyIoCContainer container)
        {
            if(app == null) throw new ArgumentException(nameof(app));

            var options = new OverseerAuthenticationOptions { Container = container };
            return app.Use<OverseerAuthenticationMiddleware>(options);
        }
    }
}
