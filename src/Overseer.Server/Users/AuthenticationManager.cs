using System.Text;
using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Users
{
  public class AuthenticationManager(IDataContext context) : IAuthenticationManager
  {
    const string Bearer = "Bearer";

    readonly IRepository<User> _users = context.GetRepository<User>();

    public UserDisplay? AuthenticateUser(UserDisplay user)
    {
      return AuthenticateUser(user.Username, user.Password);
    }

    public UserDisplay? AuthenticateUser(string? username, string? password)
    {
      if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
      {
        throw new OverseerException("invalid_username_or_password");
      }

      var user = _users.Get(u => u.Username!.ToLower() == username.ToLower()) ?? throw new OverseerException("invalid_username");
      var passwordHash = BCrypt.Net.BCrypt.HashPassword(password, user.PasswordSalt);
      if (user.PasswordHash?.SequenceEqual(passwordHash) == false)
      {
        throw new OverseerException("invalid_password");
      }

      return AuthenticateUser(user);
    }

    public User? AuthenticateToken(string token)
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

    public UserDisplay? DeauthenticateUser(string token)
    {
      if (string.IsNullOrWhiteSpace(token))
      {
        return null;
      }

      return DeauthenticateUser(_users.Get(u => u.Token == StripToken(token)));
    }

    public UserDisplay? DeauthenticateUser(int userId)
    {
      return DeauthenticateUser(_users.GetById(userId));
    }

    public string GetPreauthenticatedToken(int userId)
    {
      var user = _users.GetById(userId);
      if (user == null)
        return string.Empty;
      if (user.AccessLevel != AccessLevel.Readonly)
        return string.Empty;

      var token = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.GenerateSalt(16));
      user.PreauthenticatedToken = Convert.ToBase64String(token);
      user.PreauthenticatedTokenExpiration = DateTime.UtcNow.AddMinutes(2);
      _users.Update(user);

      return user.PreauthenticatedToken;
    }

    public UserDisplay? ValidatePreauthenticatedToken(string token)
    {
      var user = _users.Get(u => u.PreauthenticatedToken == token && u.PreauthenticatedTokenExpiration > DateTime.UtcNow);
      if (user == null)
        return null;

      return AuthenticateUser(user);
    }

    static string StripToken(string token)
    {
      if (string.IsNullOrWhiteSpace(token))
      {
        return string.Empty;
      }

      return token.Replace(Bearer, string.Empty).Trim();
    }

    UserDisplay? DeauthenticateUser(User user)
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

    UserDisplay AuthenticateUser(User user)
    {
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

      user.PreauthenticatedToken = null;
      user.PreauthenticatedTokenExpiration = null;

      _users.Update(user);
      return user.ToDisplay(includeToken: true);
    }
  }
}
