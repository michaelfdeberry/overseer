using System;

namespace Overseer.Startup.Json
{
    /// <summary>
    /// Based on code from https://github.com/NancyFx/Nancy.Serialization.JsonNet
    /// </summary>
    static class Helpers
    {
        public static bool IsJsonType(string contentType)
        {
            if (string.IsNullOrEmpty(contentType))
            {
                return false;
            }

            var contentMimeType = contentType.Split(';')[0];

            return contentMimeType.Equals("application/json", StringComparison.OrdinalIgnoreCase)
                   || contentMimeType.Equals("text/json", StringComparison.OrdinalIgnoreCase)
                   || contentMimeType.EndsWith("+json", StringComparison.OrdinalIgnoreCase);
        }
    }
}
