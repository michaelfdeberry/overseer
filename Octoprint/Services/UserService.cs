using System.Collections.Generic;
using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class UserService : OctoprintService
    {
        public UserService(OctoprintOptions options) : base(options)
        {
        }

        public Task<UserList> GetUsers()
        {
            return Execute<UserList>("users", Method.GET);
        }

        public Task<UserRecord> GetUser(string username)
        {
            return Execute<UserRecord>($"users/{username}", Method.GET);
        }

        public Task<UserList> CreateUser(UserRegistrationRequest userRegistration)
        {
            return Execute<UserList>("users", Method.POST, userRegistration);
        }

        public Task<UserList> UpdateUser(string username, bool active, bool admin)
        {
            return Execute<UserList>($"users/{username}", Method.POST, new {admin, active});
        }

        public Task<UserList> DeleteUser(string username)
        {
            return Execute<UserList>($"users/{username}", Method.DELETE);
        }

        public Task ResetPassword(string username, string password)
        {
            return Execute($"users/{username}/password", Method.PUT, new {password});
        }

        public Task<Dictionary<string, object>> RetrieveUserSettings(string username)
        {
            return Execute<Dictionary<string, object>>($"users/{username}/settings", Method.GET);
        }

        public Task UpdateUserSettings(string username, Dictionary<string, object> settings)
        {
            return Execute($"users/{username}/settings", Method.POST, settings);
        }

        public async Task<string> RegenerateUserApiKey(string username)
        {
            var result = await Execute<OctoprintApiKeyRefreshResult>($"users/{username}/apikey", Method.POST);
            return result.ApiKey;
        }

        public Task DeleteUserApiKey(string username)
        {
            return Execute($"users/{username}/apikey", Method.DELETE);
        }
    }
}