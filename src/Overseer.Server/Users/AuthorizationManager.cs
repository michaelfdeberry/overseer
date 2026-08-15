using Overseer.Server.Data;
using Overseer.Server.Machines;
using Overseer.Server.Models;

namespace Overseer.Server.Users;

public class AuthorizationManager(IUserManager userManager, IMachineManager machineManager) : IAuthorizationManager
{
  public InitializationStatus GetInitializationStatus()
  {
    var users = userManager.GetUsers();
    var adminCount = users.Count(u => u.AccessLevel == AccessLevel.Administrator);
    if (adminCount == 0)
    {
      return new() { State = InitializationState.Admin };
    }

    var machineTypes = machineManager.GetMachineMetadata();
    if (machineTypes.Count == 0)
    {
      return new() { State = InitializationState.Plugins };
    }

    var machineCounts = machineManager.GetMachines();
    if (machineCounts.Count == 0)
    {
      return new() { State = InitializationState.Machines };
    }

    return new() { State = InitializationState.Initialized };
  }
}
