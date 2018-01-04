using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Nancy;
using Overseer.Core.Data;
using Overseer.Core.Models;

namespace Overseer.Core
{
    public static class Utilities
    {
        public static string GetLocalUrl(this Uri uri, string localPath = "")
        {
            return string.Concat(uri.Scheme, "://", uri.Authority, localPath);
        }

        public static void ForEach<T>(this IEnumerable<T> enumerable, Action<T> action)
        {
            enumerable.ToList().ForEach(action);
        }

        public static float Round(this float value, int places = 0)
        {
            return (float) Math.Round(value, places);
        }

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

        public static async Task<T> WithCancellation<T>(this Task<T> task, CancellationToken cancellationToken)
        {
            var tcs = new TaskCompletionSource<bool>();
            using (cancellationToken.Register(s => ((TaskCompletionSource<bool>) s).TrySetResult(true), tcs))
            {
                if (task != await Task.WhenAny(task, tcs.Task))
                    throw new OperationCanceledException(cancellationToken);
            }

            return await task;
        }
    }
}