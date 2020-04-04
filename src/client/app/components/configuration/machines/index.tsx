import { Button, Icon } from '@material-ui/core';
import { Add, ArrowDownward, ArrowUpward, Check, DragIndicator, Edit, Warning } from '@material-ui/icons';
import * as React from 'react';
import { DragDropContext, Draggable, DraggableProvided, DraggableStateSnapshot, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../hooks';
import { getMachines, sortMachines } from '../../../operations/local/machines.operations.local';
import { invoke } from '../../../operations/operation-invoker';
import { actions } from '../../../store/actions';
import { sortByKey } from '../utils/sort.functions';

export const MachinesPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const machines = useSelector(state => state.machines);

  const move = (previousIndex: number, newIndex: number): void => {
    const machineIds = machines.sort(sortByKey('sortIndex')).map(m => m.id);
    const target = machineIds[previousIndex];
    const delta = newIndex < previousIndex ? -1 : 1;

    for (let i = previousIndex; i !== newIndex; i += delta) {
      machineIds[i] = machineIds[i + delta];
    }
    machineIds[newIndex] = target;

    invoke(dispatch, sortMachines(machineIds)).subscribe(machines => {
      dispatch(actions.machines.updateMachines(machines));
    });
  };

  const moveUp = (index: number): void => {
    if (index <= 0) return;
    move(index, --index);
  };

  const moveDown = (index: number): void => {
    if (index >= machines.length) return;
    move(index, ++index);
  };

  const onDrop = (dropResult: DropResult): void => {
    if (!dropResult.destination) return;
    if (dropResult.destination.index === dropResult.source.index) return;
    move(dropResult.source.index, dropResult.destination.index);
  };

  React.useEffect(() => {
    if (!machines) {
      invoke(dispatch, getMachines()).subscribe(machines => {
        dispatch(actions.machines.updateMachines(machines));
      });
    }
  }, [machines]);

  if (!machines) return null;

  return (
    <DragDropContext onDragEnd={onDrop}>
      <table className="config-table users">
        <thead>
          <tr>
            <th className="sort-column">Sort</th>
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
        <Droppable droppableId="table">
          {(droppableProvided: DroppableProvided) => (
            <tbody ref={(ref: HTMLElement) => { droppableProvided.innerRef(ref); }} {...droppableProvided.droppableProps}>
              {machines.sort(sortByKey('sortIndex')).map((machine, index) => {
                return (
                  <Draggable draggableId={machine.id} index={index} key={machine.id}>
                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                      <tr ref={provided.innerRef} {...provided.draggableProps} className={snapshot.isDragging ? 'dragging' : ''}>
                        <td className="sort-column">
                          <Icon className="drag" {...provided.dragHandleProps}>
                            <DragIndicator />
                          </Icon>
                          <Button disabled={!index} onClick={() => moveUp(index)}>
                            <ArrowUpward />
                          </Button>
                          <Button disabled={index === machines.length - 1} onClick={() => moveDown(index)}>
                            <ArrowDownward />
                          </Button>
                        </td>
                        <td>{machine.name}</td>
                        <td>{machine.type}</td>
                        <td className="centered">
                          {machine.disabled ? (
                            <Icon>
                              <Warning />
                            </Icon>
                          ) : (
                              <Icon>
                                <Check />
                              </Icon>
                            )}
                        </td>
                        <td className="action">
                          <Button component={Link} to={`/configuration/machines/edit/${machine.id}`}>
                            <Icon>
                              <Edit />
                            </Icon>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                );
              })}
              {droppableProvided.placeholder}
            </tbody>
          )}
        </Droppable>
      </table>
    </DragDropContext>
  );
};
