using System;

namespace Overseer.Models
{
    public class EventArgs<TPayload> : EventArgs
    {
        public TPayload Data { get; }

        public EventArgs(TPayload data)
        {
            Data = data;
        }
    }
}
