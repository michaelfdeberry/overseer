using Overseer.Data;
using System;

namespace Overseer.Updates
{
    public interface IPatch
    {
        Version Version { get; }

        void Execute(LiteDataContext context);
    }
}
