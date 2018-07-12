using Nancy;
using Nancy.TinyIoc;
using Overseer.Core;
using Overseer.Core.Data;
using Overseer.Hubs;

namespace Overseer.Startup
{
    public class OverseerBootstrapper : DefaultNancyBootstrapper
    {
        public static TinyIoCContainer Container = new TinyIoCContainer();

        readonly IDataContext _context; 
        readonly MonitoringService _monitoringService;

        public OverseerBootstrapper(IDataContext context)
        {
            _context = context;

            var applicationSettings = _context.GetApplicationSettings(); 
            _monitoringService = new MonitoringService(applicationSettings.Interval);
            _monitoringService.StatusUpdate += (sender, args) =>
            {
                StatusHub.PushStatusUpdate(args.Status);
            };
        }

        protected override void ConfigureApplicationContainer(TinyIoCContainer container)
        {
            base.ConfigureApplicationContainer(container);

            container.Register((c, n) => _context);
            container.Register((c, n) => _monitoringService);
        }

        protected override TinyIoCContainer GetApplicationContainer()
        {
            return Container;
        }

        protected override TinyIoCContainer CreateRequestContainer(NancyContext context)
        {
            return Container;
        }
    }
}