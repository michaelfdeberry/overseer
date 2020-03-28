import { Button, Icon } from '@material-ui/core';
import { Add, Check, Edit, Warning } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../../hooks';
import { getMachines } from '../../../../operations/local/machines.operations.local';
import { invokeOperation } from '../../../../operations/operation-invoker';
import { actions } from '../../../../store/actions';

export const MachinesPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const machines = useSelector(state => state.machines);

  React.useEffect(() => {
    if (!machines) {
      invokeOperation(dispatch, getMachines()).subscribe(machines => {
        dispatch(actions.machines.updateMachines(machines));
      })
    }
  }, [machines]);

  if (!machines) return null;

  return (
    <table className="config-table users">
      <thead>
        <tr>
          <th>Sort</th>
          <th>Name</th>
          <th>Machine Type</th>
          <th>Monitoring Enabled?</th>
          <th className="action">
            <Button component={Link} to="/configuration/machines/add">
              <Icon>
                <Add />
              </Icon>
              Add
            </Button>
          </th>
        </tr>
      </thead>
      <tbody>
        {machines.map(machine => {
          return (
            <tr key={machine.id}>
              <td></td>
              <td>{machine.name}</td>
              <td>{machine.type}</td>
              <td>{machine.disabled ? (<Icon><Warning /></Icon>) : (<Icon><Check /></Icon>)}</td>
              <td className="action">
                <Button component={Link} to={`/configuration/machines/edit/${machine.id}`}>
                  <Icon>
                    <Edit />
                  </Icon>
                  Edit
                </Button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
};
