using System.Security.Claims;

namespace Overseer
{
    public interface IAuthorizationManager
    {
        ClaimsIdentity Authorize(string token);
        bool RequiresAuthorization();
    }
}
