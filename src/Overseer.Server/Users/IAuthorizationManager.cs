using System.Security.Claims;

namespace Overseer.Server.Users
{
  public interface IAuthorizationManager
  {
    ClaimsIdentity? Authorize(string token);
    bool RequiresAuthorization();
  }
}
