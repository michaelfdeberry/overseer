import { DataContext } from '@overseer/common/lib/data';
import {
  AuthenticationService,
  AuthorizationService,
  MachineConfigurationService,
  MachineControlService,
  MonitoringService,
  SystemConfigurationService,
  UserConfigurationService
} from '@overseer/common/lib/services';

export type ServiceDependencies = {
  authorizationService: AuthorizationService;
  authenticationService: AuthenticationService;
  machineConfigurationService: MachineConfigurationService;
  machineControlService: MachineControlService;
  monitoringService: MonitoringService;
  systemConfigurationService: SystemConfigurationService;
  userConfigurationService: UserConfigurationService;
};

export function createServices(context: DataContext): ServiceDependencies {
  const authorizationService = new AuthorizationService(context);
  const authenticationService = new AuthenticationService(context);
  const systemConfigurationService = new SystemConfigurationService(context);
  const machineConfigurationService = new MachineConfigurationService(context);
  const machineControlService = new MachineControlService(machineConfigurationService);
  const monitoringService = new MonitoringService(machineConfigurationService, systemConfigurationService);
  const userConfigurationService = new UserConfigurationService(context);

  return {
    authorizationService,
    authenticationService,
    machineConfigurationService,
    machineControlService,
    monitoringService,
    systemConfigurationService,
    userConfigurationService
  };
}
