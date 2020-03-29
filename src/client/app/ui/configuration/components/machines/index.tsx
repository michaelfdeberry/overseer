import { Button, Icon } from '@material-ui/core';
import { Add, ArrowDownward, ArrowUpward, Check, Edit, Warning } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../../hooks';
import { getMachines, sortMachines } from '../../../../operations/local/machines.operations.local';
import { invokeOperation } from '../../../../operations/operation-invoker';
import { actions } from '../../../../store/actions';
import { sortByKey } from '../../utils/sort.functions';

export const MachinesPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const machines = useSelector(state => state.machines);

  const move = (previousIndex: number, currentIndex: number) => {
    const orderedIds = [];
    machines.forEach((machine, index) => {
      if (index === previousIndex) {
        orderedIds[currentIndex] = machine.id;
      } else if (index === currentIndex) {
        orderedIds[previousIndex] = machine.id;
      } else {
        orderedIds[index] = machine.id;
      }
    });

    invokeOperation(dispatch, sortMachines(orderedIds)).subscribe((machines) => {
      dispatch(actions.machines.updateMachines(machines));
    });
  }

  const moveUp = (index: number) => {
    if (index <= 0) return;
    move(index, --index);
  };

  const moveDown = (index: number) => {
    if (index >= machines.length) return;
    move(index, ++index);
  }

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
          <th className="hidden-mobile">Sort</th>
          <th>Name</th>
          <th>Machine Type</th>
          <th className="centered">Monitoring Enabled?</th>
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
        {machines.sort(sortByKey('sortIndex')).map((machine, index) => {
          return (
            <tr key={machine.id}>
              <td className="hidden-mobile">
                <Button disabled={!index} onClick={() => moveUp(index)}>
                  <ArrowUpward />
                </Button>
                <Button disabled={index === machines.length - 1} onClick={() => moveDown(index)}>
                  <ArrowDownward />
                </Button>
              </td>
              <td>{machine.name}</td>
              <td>{machine.type}</td>
              <td className="centered">{machine.disabled ? (<Icon><Warning /></Icon>) : (<Icon><Check /></Icon>)}</td>
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
