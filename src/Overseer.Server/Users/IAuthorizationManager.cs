using Overseer.Server.Models;

namespace Overseer.Server.Users
{
  public interface IAuthorizationManager
  {
    InitializationStatus GetInitializationStatus();
  }
}
