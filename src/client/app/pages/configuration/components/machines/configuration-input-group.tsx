import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ContextType, MachineSetting, MachineSettingGroup } from 'overseer_lib';
import * as React from 'react';

import { ConfigurationInput } from './configuration-input';

export type ConfigurationInputGroupProps = {
  currentContext: ContextType;
  name: string;
  group: MachineSettingGroup;
  updateGroup: (name: string, setting: MachineSettingGroup) => void;
};

export const ConfigurationInputGroup: React.FunctionComponent<ConfigurationInputGroupProps> = (props: ConfigurationInputGroupProps) => {
  const { currentContext, name, group, updateGroup } = props;

  function updateGroupSetting(settingName: string, setting: MachineSetting): void {
    const settings = Array.from(group.settings.keys()).reduce((result, key) => {
      if (settingName === key) {
        result.set(key, setting);
      } else {
        result.set(key, group.settings.get(key));
      }
      return result;
    }, new Map<string, MachineSetting>());

    updateGroup(name, { ...group, settings });
  }

  return (
    <ExpansionPanel expanded={group.isExpanded}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{name}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {Array.from(group.settings.keys()).map(key => {
          <ConfigurationInput currentContext={currentContext} name={key} setting={group.settings.get(key)} updateSetting={updateGroupSetting} />;
        })}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
