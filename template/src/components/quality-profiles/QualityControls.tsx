import {StyleSheet, Text, ScrollView} from 'react-native';
import React from 'react';
import ThemeConfig from '../../theme';
import Dropdown from '../../atoms/Dropdown';
import {
  useVideoQuality,
  videoProfilesArray,
  screenShareProfilesArray,
} from '../../app-state/useVideoQuality';
import Spacer from '../../atoms/Spacer';

const QualityControls = () => {
  const {
    currentVideoQuality,
    setVideoQuality,
    currentScreenShareQuality,
    setScreenShareQuality,
  } = useVideoQuality();
  const videoProfiles = videoProfilesArray.map(profile => ({
    label: profile,
    value: profile,
  }));
  const screenShareProfiles = screenShareProfilesArray.map(profile => ({
    label: profile,
    value: profile,
  }));

  const OnVideoProfileChange = ({label, value}) => {
    setVideoQuality(value);
  };

  const onScreenShareProfileChange = ({label, value}) => {
    setScreenShareQuality(value);
  };

  if (
    typeof currentVideoQuality !== 'string' ||
    typeof currentScreenShareQuality !== 'string'
  ) {
    return;
  }

  return (
    <ScrollView>
      <Text style={styles.label}>{'Video Profile'}</Text>
      <Dropdown
        data={videoProfiles}
        enabled={true}
        label={currentVideoQuality}
        onSelect={OnVideoProfileChange}
        selectedValue={currentVideoQuality}
      />
      <Spacer size={24} />
      <Text style={styles.label}>{'Screen Share Profile'}</Text>
      <Dropdown
        data={screenShareProfiles}
        enabled={true}
        label={currentScreenShareQuality}
        onSelect={onScreenShareProfileChange}
        selectedValue={currentScreenShareQuality}
      />
    </ScrollView>
  );
};

export default QualityControls;

const styles = StyleSheet.create({
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    marginBottom: 12,
  },
});
