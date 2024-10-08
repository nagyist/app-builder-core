import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import Toolbar from '../atoms/Toolbar';
import {
  ToolbarItemHide,
  ToolbarItemLabel,
  ToolbarPresetProps,
} from '../atoms/ToolbarPreset';
import {
  MeetingTitleToolbarItem,
  ParticipantCountToolbarItem,
  RecordingStatusToolbarItem,
} from './Navbar';
import {useRecording} from '../subComponents/recording/useRecording';
import {CustomToolbarMerge, CustomToolbarSorting} from '../utils/common';
import {filterObject} from '../utils';
import {useLanguage} from '../language/useLanguage';

export interface NavbarProps {
  includeDefaultItems?: boolean;
  items?: ToolbarPresetProps['items'];
}

const NavbarMobile = (props: NavbarProps) => {
  const {isRecordingActive} = useRecording();
  const defaultItems: NavbarProps['items'] = {
    'meeting-title': {
      align: 'start',
      component: MeetingTitleToolbarItem,
      order: 0,
    },
    'participant-count': {
      align: 'start',
      component: ParticipantCountToolbarItem,
      order: 1,
    },
    'recording-status': {
      align: 'start',
      component: isRecordingActive ? RecordingStatusToolbarItem : null,
      order: 2,
    },
  };
  const {items = {}, includeDefaultItems = true} = props;
  const {width, height} = useWindowDimensions();
  const {languageCode} = useLanguage();

  const isHidden = (hide: ToolbarItemHide = false) => {
    try {
      return typeof hide === 'boolean'
        ? hide
        : typeof hide === 'function'
        ? hide(width, height)
        : false;
    } catch (error) {
      console.log('debugging isHidden error', error);
      return false;
    }
  };

  const mergedItems = CustomToolbarMerge(
    includeDefaultItems ? defaultItems : {},
    items,
  );

  const startItems = filterObject(
    mergedItems,
    ([_, v]) => v?.align === 'start' && !isHidden(v?.hide),
  );

  const startItemsOrdered = CustomToolbarSorting(startItems);

  const getCustomLabel = (label: ToolbarItemLabel) => {
    if (label && typeof label === 'string') {
      return label;
    } else if (label && typeof label === 'function') {
      return label(languageCode);
    } else {
      return null;
    }
  };

  const renderContent = (orderedKeys: string[], type: 'start') => {
    const renderContentItem = [];
    let index = 0;
    orderedKeys.forEach(keyName => {
      index = index + 1;
      let ToolbarComponent = null;
      let label = null;
      let onPress = null;
      if (type === 'start') {
        ToolbarComponent = startItems[keyName]?.component;
        label = startItems[keyName]?.label;
        onPress = startItems[keyName]?.onPress;
      }
      if (ToolbarComponent) {
        renderContentItem.push(
          <ToolbarComponent
            key={`top-toolbar-${type}` + index}
            label={getCustomLabel(label)}
            onPress={onPress}
          />,
        );
      }
    });

    return renderContentItem;
  };
  return (
    <Toolbar>
      <View style={style.startContent}>
        {renderContent(startItemsOrdered, 'start')}
      </View>
    </Toolbar>
  );
};
export default NavbarMobile;
const style = StyleSheet.create({
  startContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerContent: {
    zIndex: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endContent: {
    flex: 1,
    zIndex: 9,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
