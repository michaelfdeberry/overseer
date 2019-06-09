using Overseer.Data;
using Overseer.Models;
using System;
using System.Linq;

namespace Overseer
{
    public class AuthenticationManager : IAuthenticationManager
    {
        const string Bearer = "Bearer";

        readonly IRepository<User> _users;

        public AuthenticationManager(IDataContext context)
        {
            _users = context.GetRepository<User>();
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

        public UserDisplay DeauthenticateUser(int userId)
        {
            return DeauthenticateUser(_users.GetById(userId));
        }

        public string GetPreauthenticatedToken(int userId)
        {
            var user = _users.GetById(userId);
            if (user == null) return string.Empty;
            if (user.AccessLevel != AccessLevel.Readonly) return string.Empty;

            user.PreauthenticatedToken = BCrypt.Net.BCrypt.GenerateSalt(16);
            user.PreauthenticatedTokenExpiration = DateTime.UtcNow.AddMinutes(2);
            _users.Update(user);

            return user.PreauthenticatedToken;
        }

        public UserDisplay ValidatePreauthenticatedToken(string token)
        {
            var user = _users.Get(u => u.PreauthenticatedToken == token && u.PreauthenticatedTokenExpiration > DateTime.UtcNow);
            if (user == null) return null;

            user.PreauthenticatedToken = null;
            user.PreauthenticatedTokenExpiration = null;
            _users.Update(user);

            return user.ToDisplay(true);
        }
        string StripToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return string.Empty;
            }

            return token.Replace(Bearer, string.Empty).Trim();
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
    }
}
