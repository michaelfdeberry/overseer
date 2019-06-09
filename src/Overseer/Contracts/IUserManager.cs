using Overseer.Models;
using System.Collections.Generic;

namespace Overseer
{
    public interface IUserManager
    {        
        UserDisplay CreateUser(UserDisplay userModel);
        void DeleteUser(int userId);
        UserDisplay GetUser(int userId);
        IReadOnlyList<UserDisplay> GetUsers(); 
        UserDisplay UpdateUser(UserDisplay user);
        UserDisplay ChangePassword(UserDisplay user);        
    }
}