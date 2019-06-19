using Overseer.Models;

namespace Overseer
{
    public interface IAuthenticationManager
    {
        User AuthenticateToken(string token);
        UserDisplay AuthenticateUser(string username, string password);
        UserDisplay AuthenticateUser(UserDisplay user);
        UserDisplay DeauthenticateUser(int userId);
        UserDisplay DeauthenticateUser(string token);
        string GetPreauthenticatedToken(int userId);
        UserDisplay ValidatePreauthenticatedToken(string token);
    }
}
