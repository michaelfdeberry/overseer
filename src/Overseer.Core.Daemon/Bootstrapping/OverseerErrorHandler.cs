using log4net;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Overseer.Models;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Overseer.Daemon
{
	public class OverseerErrorHandler
	{
		static readonly ILog Log = LogManager.GetLogger(typeof(OverseerErrorHandler));

		private readonly RequestDelegate next;

		public OverseerErrorHandler(RequestDelegate next)
		{
			this.next = next;
		}

		public async Task Invoke(HttpContext context)
		{
			try
			{
				await next(context);
			}
			catch (Exception ex)
			{
				await HandleExceptionAsync(context, ex);
			}
		}

		static Task HandleExceptionAsync(HttpContext context, Exception exception)
		{
			object exceptionModel;
			if (exception is OverseerException oEx)
			{
				exceptionModel = new { exceptionType = "overseer", key = oEx.Message, oEx.Properties };
			}
			else
			{
				Log.Error("Unhandled Exception", exception);
				exceptionModel = new { exceptionType = "overseer", key = "unknown", Properties = new { message = exception.Message } };
			}

			var serializerSettings = Startup.ConfigureJsonSerializer(new JsonSerializerSettings());
			var result = JsonConvert.SerializeObject(exceptionModel, serializerSettings);

			context.Response.ContentType = "application/json";
			context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
			return context.Response.WriteAsync(result);
		}
	}
}