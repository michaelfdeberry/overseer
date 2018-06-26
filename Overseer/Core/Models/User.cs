using System;
using Overseer.Core.Data;

namespace Overseer.Core.Models
{
    public class UserAuthentication
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public string Password { get; set; }

        public int? SessionLifetime { get; set; }
    }

    public class UserDisplay
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public string Token { get; set; }

        public bool IsLoggedIn { get; set; }

        public int? SessionLifetime { get; set; }
    }

    public class User : IEntity
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public byte[] PasswordHash { get; set; }

        public byte[] PasswordSalt { get; set; }
        
        public string Token { get; set; }

        public DateTime? TokenExpiration { get; set; }

        public int? SessionLifetime { get; set; }

        public UserDisplay ToDisplay(bool includeToken = false)
        {
            return new UserDisplay
            {
                Id = Id,
                Username = Username,
                SessionLifetime = SessionLifetime,
                Token = includeToken ? Token : null,
                IsLoggedIn = Token != null && (!TokenExpiration.HasValue || DateTime.UtcNow < TokenExpiration.Value)
            };
        }
    }
}