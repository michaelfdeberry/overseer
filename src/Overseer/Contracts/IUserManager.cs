using System.Collections.Generic;
using System.Security.Claims;
using Overseer.Models;

namespace Overseer
{
    public interface IUserManager
    {
        bool RequiresInitialSetup();
        User AuthenticateToken(string token);
        UserDisplay AuthenticateUser(string username, string password);
        UserDisplay AuthenticateUser(UserDisplay user);
        UserDisplay CreateUser(UserDisplay userModel);
        UserDisplay DeauthenticateUser(int userId);
        UserDisplay DeauthenticateUser(string token);
        void DeleteUser(int userId);
        UserDisplay GetUser(int userId);
        IReadOnlyList<UserDisplay> GetUsers(); 
        UserDisplay UpdateUser(UserDisplay user);
        ClaimsIdentity Authenticate(string token);
    }
}