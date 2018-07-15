using Overseer.Core.Data;
using Overseer.Core.Models;
using Sodium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Overseer.Core
{
    public class UserManager
    {
        readonly IDataContext _context;
        readonly IRepository<User> _users;

        public UserManager(IDataContext context)
        {
            _context = context;
            _users = context.GetRepository<User>();
        }

        public UserDisplay AuthenticateUser(string username, string password)
        {
            var user = _users.Get(u => u.Username.ToLower() == username.ToLower());

            if (user == null)
                throw new Exception("Invalid Username");

            var passwordHash = PasswordHash.ScryptHashBinary(Encoding.UTF8.GetBytes(password), user.PasswordSalt);
            if (PasswordHash.ScryptHashStringVerify(user.PasswordHash, passwordHash))
                throw new Exception("Invalid Password");

            if (!string.IsNullOrWhiteSpace(user.Token) && AuthenticateToken(user.Token))
                return user.ToDisplay(includeToken: true);

            user.Token = Convert.ToBase64String(SodiumCore.GetRandomBytes(8));
            if (user.SessionLifetime.HasValue)
            {
                user.TokenExpiration = DateTime.UtcNow.AddDays(user.SessionLifetime.Value);
            }
            else
            {
                user.TokenExpiration = null;
            }

            _users.Update(user);

            return user.ToDisplay(includeToken: true);
        }

        public bool AuthenticateToken(string token)
        {
            var settings = _context.GetApplicationSettings();

            //if authentication isn't required just return
            if (!settings.RequiresAuthentication) return true;

            if (string.IsNullOrWhiteSpace(token)) return false;

            token = token.Replace("Bearer", string.Empty).Trim();
            var user = _users.Get(u => u.Token == token);

            //no user or no token, means the user logged out
            if (string.IsNullOrWhiteSpace(user?.Token))
                return false;

            //if the user has a configured session lifetime there will be a token expiration date, check if it's valid
            if (user.TokenExpiration.HasValue && user.TokenExpiration.Value < DateTime.UtcNow)
                return false;

            //has a matching token that isn't expired. 
            return true;
        }

        public UserDisplay DeauthenticateUser(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;

            return DeauthenticateUser(_users.Get(u => u.Token == token));
        }

        public UserDisplay DeauthenticateUser(int userId)
        {
            return DeauthenticateUser(_users.GetById(userId));
        }

        public UserDisplay CreateUser(string username, string password, int? sessionLifetime)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new Exception("Invalid Username"); ;

            if (string.IsNullOrWhiteSpace(password))
                throw new Exception("Invalid Password");

            if (_users.Get(u => u.Username.ToLower() == username.ToLower()) != null)
                throw new Exception("Username Unavailable");

            var salt = PasswordHash.ScryptGenerateSalt();
            var hash = PasswordHash.ScryptHashBinary(Encoding.UTF8.GetBytes(password), salt);
            var user = new User
            {
                Username = username,
                PasswordSalt = salt,
                PasswordHash = hash,
                SessionLifetime = sessionLifetime
            };

            _users.Create(user);

            return user.ToDisplay();
        }

        public IReadOnlyList<UserDisplay> GetUsers()
        {
            return _users.GetAll()
                .Select(user => user.ToDisplay())
                .ToList();
        }

        public UserDisplay UpdateUser(UserAuthentication user)
        {
            if (!string.IsNullOrWhiteSpace(user.Username) && !string.IsNullOrWhiteSpace(user.Password))
            {
                //if they are changing the password delete and recreate the user.
                DeleteUser(user.Id);
                return CreateUser(user.Username, user.Password, user.SessionLifetime);
            }

            return UpdateSessionLifetime(user.Id, user.SessionLifetime);
        }

        public void DeleteUser(int userId)
        {
            var user = _users.GetById(userId);
            if (user != null)
            {
                _users.Delete(user);
            }
        }

        UserDisplay DeauthenticateUser(User user)
        {
            if (user == null) return null;

            user.Token = null;
            user.TokenExpiration = null;
            _users.Update(user);

            return user.ToDisplay();
        }

        UserDisplay UpdateSessionLifetime(int userId, int? sessionLifetime)
        {
            var user = _users.GetById(userId);
            if (user == null) return null;

            //forces a new login
            user.Token = null;
            user.TokenExpiration = null;
            user.SessionLifetime = sessionLifetime;
            _users.Update(user);

            return user.ToDisplay();
        }
    }
}
