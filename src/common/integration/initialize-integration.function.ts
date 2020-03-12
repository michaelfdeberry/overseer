import * as initializers from '.';
import { MachineConfigurationBuilder, machineConfigurationBuilder } from '../models/machines';

export default function(): void {
  const factories: Array<() => [string, MachineConfigurationBuilder]> = Object.values(initializers);
  factories.forEach(f => {
    const [name, config] = f();
    machineConfigurationBuilder.set(name, config);
  });
}
