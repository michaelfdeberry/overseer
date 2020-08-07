import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BuildRestrictionType, MachineSetting, MachineSettingGroup, PersistenceModeType } from '@overseer/common/lib/models';
import * as React from 'react';

import { ConfigurationInput } from './configuration-input';

export type ConfigurationInputGroupProps = {
  name: string;
  mode: PersistenceModeType;
  group: MachineSettingGroup;
  restriction: BuildRestrictionType;
  updateGroup: (name: string, setting: MachineSettingGroup) => void;
};

export const ConfigurationInputGroup: React.FunctionComponent<ConfigurationInputGroupProps> = (props: ConfigurationInputGroupProps) => {
  const { mode, name, group, updateGroup, restriction } = props;

  function updateGroupSetting(settingName: string, setting: MachineSetting): void {
    updateGroup(name, { ...group, settings: { ...group.settings, [settingName]: setting } });
  }

  return (
    <ExpansionPanel expanded={group.isExpanded}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{name}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {Object.keys(group.settings).map((key) => {
          const setting = group.settings[key];
          if (!(setting.mode & mode)) return null;
          if (setting.restriction && setting.restriction !== restriction) return null;

          return <ConfigurationInput key={key} name={key} setting={setting} updateSetting={updateGroupSetting} />;
        })}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
