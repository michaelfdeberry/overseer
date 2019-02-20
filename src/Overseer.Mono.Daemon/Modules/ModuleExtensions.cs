using Nancy;
using System;
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
    }
}
