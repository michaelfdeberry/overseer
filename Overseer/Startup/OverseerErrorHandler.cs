using log4net;
using Nancy;
using Nancy.ErrorHandling;
using Nancy.Extensions;
using Nancy.Responses;

namespace Overseer.Startup
{
    public class OverseerErrorHandler : IStatusCodeHandler
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OverseerErrorHandler));

        public bool HandlesStatusCode(HttpStatusCode statusCode, NancyContext context)
        {
            return (int) statusCode >= 400;
        }

        public void Handle(HttpStatusCode statusCode, NancyContext context)
        {
            var exception = context.GetException();
            if (exception != null)
            {
                Log.Error("Server Error", exception);

                if (exception.InnerException != null)
                {
                    exception = exception.InnerException;
                }

                var error = exception.Message;
                context.Response = new JsonResponse(new { error }, new DefaultJsonSerializer())
                {
                    StatusCode = HttpStatusCode.BadRequest
                };
            }
        }
    }
}