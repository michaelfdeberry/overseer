using System;

namespace Overseer.Models
{
    public class OverseerException : Exception
    {
        public object Properties { get; set; }

        public OverseerException(string key, object properties = null)
            : base(key)
        {
            Properties = properties;
        }

        public static void Unwrap(Exception ex)
        {
            if (ex is OverseerException) throw ex;

            //mono wraps this in an additional exceptions for when a certificate exception is thrown,
            //so check all inner exceptions
            var innerEx = ex.InnerException;
            while (innerEx != null)
            {
                if (innerEx is OverseerException) throw innerEx;
                innerEx = innerEx.InnerException;
            }
        }
    }
}
