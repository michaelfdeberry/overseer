using Fclp;
using Overseer.Daemon.Bootstrapping;
using Overseer.Data;
using Overseer.Models;
using System;

namespace Overseer.Daemon
{
    public class Launcher : IDisposable
    {
        readonly IDataContext _context;

        public OverseerBootstrapper Bootstrapper { get; }
                
        public Launcher()
        {
            _context = new LiteDataContext();
            Bootstrapper = new OverseerBootstrapper(_context);
        }

        public string Launch(string[] args)
        {
            if (!UpdateManager.Update()) throw new Exception("Update Process Failed");

            var valueStore = _context.GetValueStore();
            var settings = valueStore.GetOrPut(() => new ApplicationSettings());

            var parser = new FluentCommandLineParser();
            parser.Setup<int>("port").Callback(port => settings.LocalPort = port);
            parser.Setup<int>("interval").Callback(interval => settings.Interval = interval);
            parser.Parse(args);
            valueStore.Put(settings);
            
            return $"http://localhost:{settings.LocalPort}/";
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}
