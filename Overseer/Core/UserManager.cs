using Overseer.Core.Data;
using Overseer.Core.Models;
using Sodium;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Overseer.Core.Exceptions;

namespace Overseer.Core
{
    public class UserManager
    {
        const string Bearer = "Bearer";
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
                throw new OverseerException("invalid_username");

            var passwordHash = PasswordHash.ScryptHashBinary(Encoding.UTF8.GetBytes(password), user.PasswordSalt);
            if (!user.PasswordHash.SequenceEqual(passwordHash))
                throw new OverseerException("invalid_password");

            if (!string.IsNullOrWhiteSpace(user.Token) && AuthenticateToken(user.Token) != null)
                return user.ToDisplay(includeToken: true);

            user.Token = Convert.ToBase64String(SodiumCore.GetRandomBytes(16));
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

        public bool IsAuthenticated(string token)
        {
            var settings = _context.GetApplicationSettings();
            if (!settings.RequiresAuthentication) return true;

            return AuthenticateToken(token) != null;
        }

        public User AuthenticateToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            var user = _users.Get(u => u.Token == StripToken(token));
            
            if (user.IsTokenExpired())
                return null;
            
            //has a matching token that isn't expired. 
            return user;
        }

        public UserDisplay DeauthenticateUser(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;
            
            return DeauthenticateUser(_users.Get(u => u.Token == StripToken(token)));
        }

        string StripToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return string.Empty;
            return token.Replace(Bearer, string.Empty).Trim();
        }

        public UserDisplay DeauthenticateUser(int userId)
        {
            return DeauthenticateUser(_users.GetById(userId));
        }

        public UserDisplay CreateUser(string username, string password, int? sessionLifetime)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new OverseerException("invalid_username"); ;

            if (string.IsNullOrWhiteSpace(password))
                throw new OverseerException("invalid_password");

            if (_users.Get(u => u.Username.ToLower() == username.ToLower()) != null)
                throw new OverseerException("unavailable_username");

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

        public UserDisplay GetUser(int userId)
        {
            return _users.GetById(userId).ToDisplay();
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
