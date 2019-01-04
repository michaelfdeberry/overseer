using Microsoft.AspNet.SignalR;
using Nancy;
using Nancy.TinyIoc;
using Newtonsoft.Json;
using Overseer.Daemon.Hubs;
using Overseer.Data;
using Overseer.Machines;
using Overseer.Models;
using System;

namespace Overseer.Daemon.Startup
{
	public class OverseerBootstrapper : DefaultNancyBootstrapper
    {
        public static TinyIoCContainer Container = new TinyIoCContainer();

		CertificateExceptionHandler _certificateExceptionHandler;
        readonly IDataContext _context;
		MonitoringService _monitoringService;

        public OverseerBootstrapper(IDataContext context)
        {
            _context = context;
			
			GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () =>
			{
				var serializer = new JsonSerializer();
				serializer.ContractResolver = new OverseerContractResolver();
				serializer.Formatting = Formatting.None;

				return serializer;
			});
			
			GlobalHost.DependencyResolver.Register(typeof(StatusHub), () =>
			{
				return Container.Resolve<StatusHub>();
			});
		}

		protected override void ConfigureApplicationContainer(TinyIoCContainer container)
        {
            base.ConfigureApplicationContainer(container);

            container.Register((c, n) => _context);
			
            container.Register<Func<Machine, IMachineProvider>>((c, n) => machine =>
            {
				var machineType = MachineProviderManager.GetProviderType(machine);
				var provider = (IMachineProvider)Activator.CreateInstance(machineType, machine);

				return provider;
			});

			container.Register<IConfigurationManager, ConfigurationManager>();
			container.Register<IUserManager, UserManager>();
			container.Register<IMachineManager, MachineManager>();
			container.Register<IControlManager, ControlManager>();

			container.Register<IMonitoringService>((c, n) =>
			{
				if (_monitoringService == null)
				{
					_monitoringService = new MonitoringService(
						c.Resolve<MachineManager>(), 
						c.Resolve<ConfigurationManager>(), 
						c.Resolve<MachineProviderManager>());

					_monitoringService.StatusUpdate += (s, args) =>
					{
						StatusHub.PushStatusUpdate(args.Data);
					};
				}

				return _monitoringService;
			});

			_certificateExceptionHandler = container.Resolve<CertificateExceptionHandler>();
			_certificateExceptionHandler.Initialize();
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