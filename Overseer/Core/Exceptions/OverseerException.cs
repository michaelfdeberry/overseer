using System;

namespace Overseer.Core.Exceptions
{
    class OverseerException : Exception
    {
        public object Properties { get; set; }

        public OverseerException(string key, object properties = null)
            : base(key)
        {
            Properties = properties;
        }
    }
}
