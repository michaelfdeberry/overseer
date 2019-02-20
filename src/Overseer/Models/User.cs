using Overseer.Data;
using System;

namespace Overseer.Models
{
    /// <summary>
    /// This is the user object that is send to and from the client
    /// </summary>
    public class UserDisplay
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public string Password { get; set; }

        public int? SessionLifetime { get; set; }

        public string Token { get; set; }

        public bool IsLoggedIn { get; set; }
    }

    /// <summary>
    /// This is the user as represented in the database
    /// </summary>
    public class User : IEntity
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public string PasswordHash { get; set; }

        public string PasswordSalt { get; set; }
        
        public string Token { get; set; }

        public DateTime? TokenExpiration { get; set; }

        public int? SessionLifetime { get; set; }

        /// <summary>
        /// Helper method to quickly convert a user to a user display object
        /// </summary>
        public UserDisplay ToDisplay(bool includeToken = false)
        {
            return new UserDisplay
            {
                Id = Id,
                Username = Username,
                SessionLifetime = SessionLifetime,
                Token = includeToken ? Token : null,
                IsLoggedIn = !this.IsTokenExpired()
            };
        }
    }

    public static class UserExtensions
    {
        public static bool IsTokenExpired(this User user)
        {
            //if the user or token is null it's considered expired
            if (string.IsNullOrWhiteSpace(user?.Token)) return true;

            //if there is no expiration set the, with the presence of a token, the user
            //is configured for indefinite session length
            if (!user.TokenExpiration.HasValue) return false;

            //otherwise the tokens is expired if it's expiration date is less than the current UTC time
            return user.TokenExpiration.Value < DateTime.UtcNow;
        }
    }
}