import { Machine, MachineConfigurationCollection } from '@overseer/common/models';
import axios, { AxiosResponse } from 'axios';
import { Observable, Observer } from 'rxjs';

import { getBearerConfig } from './utilities/request-configs';

export function getMachines(): Observable<Machine[]> {
  return Observable.create((observer: Observer<Machine[]>) => {
    axios
      .get('/api/machines', getBearerConfig())
      .then((response: AxiosResponse<Machine[]>) => {
        observer.next(response.data.map((machine) => Object.assign(new Machine(), machine)));
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function getMachine(machineId: string): Observable<Machine> {
  return Observable.create((observer: Observer<Machine>) => {
    axios
      .get(`/api/machines/${machineId}`, getBearerConfig())
      .then((response: AxiosResponse<Machine>) => {
        observer.next(Object.assign(new Machine(), response.data));
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function createMachine(machineType: string, configuration: MachineConfigurationCollection): Observable<Machine> {
  return Observable.create((observer: Observer<Machine>) => {
    axios
      .put('/api/machines', { machineType, configuration }, getBearerConfig())
      .then((response: AxiosResponse<Machine>) => {
        observer.next(Object.assign(new Machine(), response.data));
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function updateMachine(machine: Machine): Observable<Machine> {
  return Observable.create((observer: Observer<Machine>) => {
    axios
      .post('/api/machines', machine, getBearerConfig())
      .then((response: AxiosResponse<Machine>) => {
        observer.next(Object.assign(new Machine(), response.data));
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function deleteMachine(machine: Machine): Observable<void> {
  return Observable.create((observer: Observer<void>) => {
    axios
      .delete(`/api/machines/${machine.id}`, getBearerConfig())
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}

export function sortMachines(sortOrder: string[]): Observable<Machine[]> {
  return Observable.create((observer: Observer<Machine[]>) => {
    axios
      .post('/api/machines/sort', sortOrder, getBearerConfig())
      .then((response: AxiosResponse<Machine[]>) => {
        observer.next(response.data.map((machine) => Object.assign(new Machine(), machine)));
        observer.complete();
      })
      .catch((error: Error) => observer.error(error));
  });
}
