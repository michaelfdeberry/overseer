using Overseer.Server.Models;

namespace Overseer.Server.Users;

public interface IAuthenticationManager
{
  User? AuthenticateToken(string token);
  UserDisplay? AuthenticateUser(string username, string password);
  UserDisplay? AuthenticateUser(UserDisplay user);
  UserDisplay? DeauthenticateUser(int userId);
  UserDisplay? DeauthenticateUser(string token);
  string? GetPreauthenticatedToken(int userId);
  UserDisplay? ValidatePreauthenticatedToken(string token);
}
