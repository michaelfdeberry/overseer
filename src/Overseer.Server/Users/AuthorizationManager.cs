using System.Security.Claims;
using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Users;

public class AuthorizationManager(IDataContext context, IAuthenticationManager authenticationManager) : IAuthorizationManager
{
  readonly IAuthenticationManager _authenticationManager = authenticationManager;
  readonly IRepository<User> _users = context.Repository<User>();

  public bool RequiresAuthorization()
  {
    return _users.Count(u => u.AccessLevel == AccessLevel.Administrator) == 0;
  }

  public ClaimsIdentity? Authorize(string token)
  {
    var user = _authenticationManager.AuthenticateToken(token);
    if (user == null)
      return null;

    var identity = new ClaimsIdentity(user.Username);
    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
    identity.AddClaim(new Claim(ClaimTypes.Role, user.AccessLevel.ToString()));

    return identity;
  }
}
