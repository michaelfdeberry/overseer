using System;
using System.Collections.Generic;
using System.Linq;
using System.Net; 
using Overseer.Core.Data;
using Overseer.Core.Models;

namespace Overseer.Core
{
    public static class Utilities
    {
        public static string ProcessUrl(this Uri uri, string refPath = "")
        {
            if (Uri.TryCreate(refPath, UriKind.Absolute, out var refUri) && refUri.Scheme.StartsWith("http"))
            {                
                //if the host is a loopback ip address assume it's local to base uri and construct a new url
                //with the public host
                if (IPAddress.TryParse(refUri.Host, out var ip) && IPAddress.IsLoopback(ip))
                {
                    var port = string.Empty;
                    if (!refUri.IsDefaultPort)
                    {
                        port = $":{refUri.Port}";
                    }

                    return $"{uri.Scheme}://{uri.Host}{port}{refUri.PathAndQuery}";
                }

                //if the reference path is an absolute url use the absolute url. 
                return refUri.ToString();
            }
            
            //else construct a new url with the reference path
            return $"{uri.Scheme}://{uri.Authority}{refPath}";
        }

        public static void ForEach<T>(this IEnumerable<T> enumerable, Action<T> action)
        {
            enumerable.ToList().ForEach(action);
        }

        public static float Round(this float value, int places = 0)
        {
            return (float)Math.Round(value, places);
        }

        public static ApplicationSettings GetApplicationSettings(this IDataContext context)
        {
            var repository = context.GetRepository<ApplicationSettings>();
            var settings = repository.GetById(1);
            if (settings == null)
            {
                settings = new ApplicationSettings();
                repository.Create(settings);
            }

            return settings;
        }

        public static void UpdateApplicationSettings(this IDataContext context, ApplicationSettings settings)
        {
            context.GetRepository<ApplicationSettings>().Update(settings);
        }
    }
}