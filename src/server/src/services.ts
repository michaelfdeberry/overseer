import { DataContext } from '@overseer/common/data';
import {
  AuthenticationService,
  AuthorizationService,
  MachineConfigurationService,
  MachineControlService,
  MachineProviderService,
  MonitoringService,
  SystemConfigurationService,
  UserConfigurationService
} from '@overseer/common/services';

export type ServiceDependencies = {
  authorizationService: AuthorizationService;
  authenticationService: AuthenticationService;
  machineConfigurationService: MachineConfigurationService;
  machineControlService: MachineControlService;
  machineProviderService: MachineProviderService;
  monitoringService: MonitoringService;
  systemConfigurationService: SystemConfigurationService;
  userConfigurationService: UserConfigurationService;
};

export function createServices(context: DataContext): ServiceDependencies {
  const machineProviderService = new MachineProviderService();
  const authorizationService = new AuthorizationService(context);
  const authenticationService = new AuthenticationService(context);
  const systemConfigurationService = new SystemConfigurationService(context);
  const machineControlService = new MachineControlService(context, machineProviderService);
  const machineConfigurationService = new MachineConfigurationService(context, machineProviderService);
  const monitoringService = new MonitoringService(context, machineProviderService);
  const userConfigurationService = new UserConfigurationService(context);

  return {
    authorizationService,
    authenticationService,
    machineConfigurationService,
    machineControlService,
    machineProviderService,
    monitoringService,
    systemConfigurationService,
    userConfigurationService,
  };
}
