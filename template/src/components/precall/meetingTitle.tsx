import React from 'react';
import {Text, StyleSheet, View, TextStyle} from 'react-native';
import ThemeConfig from '../../theme';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';

export interface MeetingTitleProps {
  textStyle?: TextStyle;
}
const MeetingTitle: React.FC = (props?: MeetingTitleProps) => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  return (
    <Text style={[style.titleHeading, props?.textStyle ? props.textStyle : {}]}>
      {meetingTitle}
    </Text>
  );
};

export default MeetingTitle;

const style = StyleSheet.create({
  titleHeading: {
    padding: 32,
    fontSize: 24,
    fontWeight: '700',
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
