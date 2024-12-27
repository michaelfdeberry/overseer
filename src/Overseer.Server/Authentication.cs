using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace Overseer.Server
{
    public class OverseerAuthenticationOptions : AuthenticationSchemeOptions
    {
        public const string OverseerAuthenticationName = "Overseer Authentication";
        public const string OverseerAuthenticationScheme = "Overseer Scheme";

        public static void Setup(AuthenticationOptions options)
        {
            options.DefaultAuthenticateScheme = OverseerAuthenticationScheme;
            options.DefaultChallengeScheme = OverseerAuthenticationScheme;
        }
    }

    public class OverseerAuthenticationHandler : AuthenticationHandler<OverseerAuthenticationOptions>
    {
        readonly IAuthorizationManager _authorizationManager;

        public OverseerAuthenticationHandler(
            IOptionsMonitor<OverseerAuthenticationOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            IAuthorizationManager authorizationManager
        )
            : base(options, logger, encoder)
        {
            _authorizationManager = authorizationManager;
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        { 
            var identity = _authorizationManager.Authorize(Context.Request.Headers.Authorization);
            if (identity == null)
                return Task.FromResult(AuthenticateResult.NoResult());
            
            var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), OverseerAuthenticationOptions.OverseerAuthenticationScheme);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }

    public static class AuthenticationExtensions
    {
        public static AuthenticationBuilder UseOverseerAuthentication(this AuthenticationBuilder builder)
        {
            return builder.UseOverseerAuthentication(options => { });
        }

        public static AuthenticationBuilder UseOverseerAuthentication(this AuthenticationBuilder builder, Action<OverseerAuthenticationOptions> configurationOptions)
        {
            return builder.AddScheme<OverseerAuthenticationOptions, OverseerAuthenticationHandler>(
                OverseerAuthenticationOptions.OverseerAuthenticationScheme,
                OverseerAuthenticationOptions.OverseerAuthenticationName,
                configurationOptions
            );
        }
    }
}
