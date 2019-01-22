using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Security.Claims;
using System.Security.Principal;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace Overseer.Daemon
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
		readonly IUserManager _userManager;

		public OverseerAuthenticationHandler(
			IOptionsMonitor<OverseerAuthenticationOptions> options,
			ILoggerFactory logger,
			UrlEncoder encoder,
			ISystemClock clock,
			IUserManager userManager
		)
			: base(options, logger, encoder, clock)
		{
			_userManager = userManager;
		}

		protected override Task<AuthenticateResult> HandleAuthenticateAsync()
		{
			var user = _userManager.AuthenticateToken(Context.Request.Headers["Authorization"]);
			if (user == null)
				return Task.FromResult(AuthenticateResult.Fail("invalid_token"));

			var identity = new GenericIdentity(user.Username, "Admin");
			var principle = new ClaimsPrincipal(identity);
			var ticket = new AuthenticationTicket(principle, null);

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
