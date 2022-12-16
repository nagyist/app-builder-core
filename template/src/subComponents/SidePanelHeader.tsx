import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import IconButton from '../atoms/IconButton';
import ThemeConfig from '../theme';
import {IconsInterface} from '../atoms/CustomIcon';

export interface SidePanelHeaderProps {
  centerComponent?: React.ReactNode;
  leadingIconName?: keyof IconsInterface;
  leadingIconOnPress?: () => void;
  trailingIconName?: keyof IconsInterface;
  trailingIconOnPress?: () => void;
  isChat?: boolean;
}
const SidePanelHeader = (props: SidePanelHeaderProps) => {
  const {isChat = false} = props;
  return (
    <View
      style={[
        SidePanelStyles.sidePanelHeader,
        isChat ? SidePanelStyles.chatPadding : {},
      ]}>
      {props?.leadingIconName ? (
        <IconButton
          iconProps={{
            iconType: 'plain',
            iconSize: 20,
            name: props.leadingIconName,
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            props?.leadingIconOnPress && props.leadingIconOnPress();
          }}
        />
      ) : isChat ? (
        <View style={{width: 20, height: 'auto'}}></View>
      ) : (
        <></>
      )}
      {props?.centerComponent ? props.centerComponent : <></>}
      {props?.trailingIconName ? (
        <IconButton
          iconProps={{
            iconType: 'plain',
            iconSize: 20,
            name: props?.trailingIconName,
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            props?.trailingIconOnPress && props.trailingIconOnPress();
          }}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

export const SidePanelStyles = StyleSheet.create({
  sidePanelHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: $config.CARD_LAYER_3_COLOR,
  },
  chatPadding: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  heading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    alignSelf: 'center',
  },
  alignCenterNoPadding: {
    padding: 0,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default SidePanelHeader;