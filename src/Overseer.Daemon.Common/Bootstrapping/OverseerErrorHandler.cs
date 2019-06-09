using log4net;
using Nancy;
using Nancy.ErrorHandling;
using Nancy.Extensions;
using Nancy.Responses;
using Overseer.Models;

namespace Overseer.Daemon.Bootstrapping
{
    public class OverseerErrorHandler : IStatusCodeHandler
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OverseerErrorHandler));

        public bool HandlesStatusCode(HttpStatusCode statusCode, NancyContext context)
        {
            return (int)statusCode >= 400;
        }

        public void Handle(HttpStatusCode statusCode, NancyContext context)
        {
            var exception = context.GetException();
            if (exception == null) return;

            Log.Error("Server Error", exception);
            if (exception.InnerException != null)
            {
                exception = exception.InnerException;
            }

            object exceptionModel;
            if (exception is OverseerException oEx)
            {
                exceptionModel = new { error = oEx.Message, oEx.Properties };
            }
            else
            {
                exceptionModel = new { error = exception.Message };
            }

            var serializer = new DefaultJsonSerializer(context.Environment);
            context.Response = new JsonResponse(exceptionModel, serializer, context.Environment)
            {
                StatusCode = HttpStatusCode.BadRequest
            };
        }
    }
}