import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ContextType, MachineSetting, MachineSettingGroup } from '@overseer/common/models';
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
    updateGroup(name, { ...group, settings: { ...group.settings, [settingName]: setting } });
  }

  return (
    <ExpansionPanel expanded={group.isExpanded}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{name}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {Object.keys(group.settings).map(key => {
          return (
            <ConfigurationInput
              key={key}
              currentContext={currentContext}
              name={key}
              setting={group.settings[key]}
              updateSetting={updateGroupSetting}
            />
          );
        })}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
