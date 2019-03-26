using Overseer.Data;
using Overseer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Overseer
{
    public class UserManager : IUserManager
    {
        const string Bearer = "Bearer";
        
        readonly IRepository<User> _users;

        public UserManager(IDataContext context)
        {
            _users = context.GetRepository<User>();
        }
        
        public bool RequiresInitialSetup()
        {
            return _users.Count() == 0;
        }

        public UserDisplay AuthenticateUser(UserDisplay user)
        {
            return AuthenticateUser(user.Username, user.Password);
        }

        public UserDisplay AuthenticateUser(string username, string password)
        {
            var user = _users.Get(u => u.Username.ToLower() == username.ToLower());

            if (user == null)
            {
                throw new OverseerException("invalid_username");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password, user.PasswordSalt);
            if (!user.PasswordHash.SequenceEqual(passwordHash))
            {
                throw new OverseerException("invalid_password");
            }

            if (!user.IsTokenExpired())
            {
                return user.ToDisplay(includeToken: true);
            }

            user.Token = BCrypt.Net.BCrypt.GenerateSalt(16);
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
        
        public User AuthenticateToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return null;
            }

            var user = _users.Get(u => u.Token == StripToken(token));

            if (user.IsTokenExpired())
            {
                return null;
            }

            //has a matching token that isn't expired. 
            return user;
        }

        public UserDisplay DeauthenticateUser(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return null;
            }

            return DeauthenticateUser(_users.Get(u => u.Token == StripToken(token)));
        }

        string StripToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return string.Empty;
            }

            return token.Replace(Bearer, string.Empty).Trim();
        }

        public UserDisplay DeauthenticateUser(int userId)
        {
            return DeauthenticateUser(_users.GetById(userId));
        }

        public UserDisplay CreateUser(UserDisplay userModel)
        {
            if (string.IsNullOrWhiteSpace(userModel.Username))
            {
                throw new OverseerException("invalid_username");
            };

            if (string.IsNullOrWhiteSpace(userModel.Password))
            {
                throw new OverseerException("invalid_password");
            }

            if (_users.Exist(u => u.Username.ToLower() == userModel.Username.ToLower()))
            {
                throw new OverseerException("unavailable_username");
            }

            var salt = BCrypt.Net.BCrypt.GenerateSalt();
            var hash = BCrypt.Net.BCrypt.HashPassword(userModel.Password, salt);

            var user = new User
            {
                Username = userModel.Username,
                PasswordSalt = salt,
                PasswordHash = hash,
                SessionLifetime = userModel.SessionLifetime,
                AccessLevel = userModel.AccessLevel
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

        public UserDisplay UpdateUser(UserDisplay user)
        {
            if (!string.IsNullOrWhiteSpace(user.Username) && !string.IsNullOrWhiteSpace(user.Password))
            {
                //if they are changing the password delete and recreate the user.
                _users.Delete(user.Id);
                return CreateUser(user);
            }

            return UpdateSessionLifetime(user.Id, user.SessionLifetime);
        }

        public void DeleteUser(int userId)
        {
            var users = _users.GetAll();
            if (users.Count == 1)
                throw new OverseerException("delete_user_unavailable");

            var user = users.FirstOrDefault(u => u.Id == userId);
            if (user.AccessLevel == AccessLevel.Administrator && 
                users.Count(u => u.AccessLevel == AccessLevel.Administrator) == 1)
                throw new OverseerException("delete_user_unavailable");            
            
            _users.Delete(userId);
        }

        UserDisplay DeauthenticateUser(User user)
        {
            if (user == null)
            {
                return null;
            }

            user.Token = null;
            user.TokenExpiration = null;
            _users.Update(user);

            return user.ToDisplay();
        }

        UserDisplay UpdateSessionLifetime(int userId, int? sessionLifetime)
        {
            var user = _users.GetById(userId);
            if (user == null)
            {
                return null;
            }

            //forces a new login
            user.Token = null;
            user.TokenExpiration = null;
            user.SessionLifetime = sessionLifetime;
            _users.Update(user);

            return user.ToDisplay();
        }

        public ClaimsIdentity Authenticate(string token)
        {
            var user = AuthenticateToken(token);
            if (user == null) return null;

            var identity = new ClaimsIdentity(user.Username);
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
            identity.AddClaim(new Claim(ClaimTypes.Role, user.AccessLevel.ToString()));

            return identity;
        }
    }
}
