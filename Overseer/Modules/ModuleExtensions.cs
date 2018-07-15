using Nancy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Nancy.ModelBinding;
using Overseer.Core;
using Overseer.Startup;

namespace Overseer.Modules
{
    public static class ModuleExtensions
    {
        public static HttpStatusCode Ok(this NancyModule module, Action action)
        {
            action.Invoke();
            return HttpStatusCode.OK;
        }

        public static async Task<HttpStatusCode> Ok(this NancyModule module, Func<Task> asyncFunc)
        {
            await asyncFunc.Invoke();
            return HttpStatusCode.OK;
        }

        public static void RequiresAuthentication(this NancyModule module)
        {
            module.Before.AddItemToEndOfPipeline(RequiresAuthentication);
        }

        public static Response RequiresAuthentication(this NancyContext context)
        {
            var userManager = OverseerBootstrapper.Container.Resolve<UserManager>();
            var token = context.Request.Headers["Authorization"]?.FirstOrDefault();
            
            if (!userManager.AuthenticateToken(token))
                return new Response { StatusCode = HttpStatusCode.Unauthorized };
            
            return null;
        }
    }

    public class DynamicModelBinder : IModelBinder
    {
        public object Bind(NancyContext context, Type modelType, object instance, BindingConfig configuration, params string[] blackList)
        {
            var data =
                GetDataFields(context);

            var model =
                DynamicDictionary.Create(data);

            return model;
        }

        static IDictionary<string, object> GetDataFields(NancyContext context)
        {
            return Merge(new IDictionary<string, string>[]
            {
                ConvertDynamicDictionary(context.Request.Form),
                ConvertDynamicDictionary(context.Request.Query),
                ConvertDynamicDictionary(context.Parameters)
            });
        }

        static IDictionary<string, object> Merge(IEnumerable<IDictionary<string, string>> dictionaries)
        {
            var output =
                new Dictionary<string, object>(StringComparer.InvariantCultureIgnoreCase);

            foreach (var dictionary in dictionaries.Where(d => d != null))
            {
                foreach (var kvp in dictionary)
                {
                    if (!output.ContainsKey(kvp.Key))
                    {
                        output.Add(kvp.Key, kvp.Value);
                    }
                }
            }

            return output;
        }

        static IDictionary<string, string> ConvertDynamicDictionary(DynamicDictionary dictionary)
        {
            return dictionary.GetDynamicMemberNames().ToDictionary(
                memberName => memberName,
                memberName => (string)dictionary[memberName]);
        }

        public bool CanBind(Type modelType)
        {
            return modelType == typeof(DynamicDictionary);
        }
    }
}
