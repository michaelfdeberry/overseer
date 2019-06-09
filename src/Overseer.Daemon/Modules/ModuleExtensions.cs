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
        public static async Task<HttpStatusCode> OkAsync(this NancyModule module, Func<Task> asyncFunc)
        {
            if (module == null) return HttpStatusCode.BadRequest;

            await asyncFunc.Invoke();
            return HttpStatusCode.OK;
        }

        public static void RequiresAdmin(this NancyModule module)
        {
            module.RequiresRole(AccessLevel.Administrator);
        }

        public static void RequiresRole(this NancyModule module, AccessLevel accessLevel)
        {
            module.RequiresClaims(claims => claims.Type == ClaimTypes.Role && claims.Value == accessLevel.ToString());
        }
    }
}
