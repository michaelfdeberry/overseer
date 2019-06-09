using Nancy;
using Nancy.TinyIoc;
using Overseer.Daemon.Hubs;
using Overseer.Daemon.Modules;
using Overseer.Data;
using Overseer.Machines;
using Overseer.Models;
using System;

namespace Overseer.Daemon.Bootstrapping
{
    public class OverseerBootstrapper : DefaultNancyBootstrapper
    {
        public TinyIoCContainer Container = new TinyIoCContainer();

        CertificateExceptionHandler _certificateExceptionHandler;

        readonly IDataContext _context;
        MonitoringService _monitoringService;

        public OverseerBootstrapper(IDataContext context)
        {
            _context = context;
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

            container.Register<IAuthenticationManager, AuthenticationManager>();
            container.Register<IAuthorizationManager, AuthorizationManager>();
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

                    _monitoringService.StatusUpdate += (sender, args) =>
                    {
                        c.Resolve<Action<MachineStatus>>()?.Invoke(args.Data);
                    };
                }

                return _monitoringService;
            });

            container.Register<StatusHubService>();
            container.Register<AuthenticationModule>();
            container.Register<AuthorizationModule>();
            container.Register<ConfigurationModule>();
            container.Register<ControlModule>();
            container.Register<MachinesModule>();
            container.Register<UsersModule>();

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