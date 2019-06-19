using Overseer.Data;
using Overseer.Models;
using System.Linq;
using System.Security.Claims;

namespace Overseer
{
    public class AuthorizationManager : IAuthorizationManager
    {
        readonly IAuthenticationManager _authenticationManager;
        readonly IRepository<User> _users;

        public AuthorizationManager(IDataContext context, IAuthenticationManager authentiactionManager)
        {
            _users = context.GetRepository<User>();
            _authenticationManager = authentiactionManager;
        }

        public bool RequiresAuthorization()
        {
            return _users.GetAll().Count(u => u.AccessLevel == AccessLevel.Administrator) == 0;
        }

        public ClaimsIdentity Authorize(string token)
        {
            var user = _authenticationManager.AuthenticateToken(token);
            if (user == null) return null;

            var identity = new ClaimsIdentity(user.Username);
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
            identity.AddClaim(new Claim(ClaimTypes.Role, user.AccessLevel.ToString()));

            return identity;
        }
    }
}
