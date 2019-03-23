using Nancy;
using Nancy.Security;
using Overseer.Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Overseer.Daemon.Modules
{
    public static class ModuleExtensions
    {
        public static HttpStatusCode Ok(this NancyModule module, Action action)
        {
            action.Invoke();
            return HttpStatusCode.OK;
        }

        public static async Task<HttpStatusCode> OkAsync(this NancyModule module, Func<Task> asyncFunc)
        {
            await asyncFunc.Invoke();
            return HttpStatusCode.OK;
        }

        public static void RequireAdmin(this NancyModule module)
        {
            module.RequireRole(AccessLevel.Administrator);
        }

        public static void RequireRole(this NancyModule module, AccessLevel accessLevel)
        {
            module.RequiresClaims(claims => claims.Type == ClaimTypes.Role && claims.Value == accessLevel.ToString());
        }
    }
}
