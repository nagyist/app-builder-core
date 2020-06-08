import React from 'react';
import {Image, TouchableOpacity} from 'react-native';
import styles from '../components/styles';

export default function Recording(props) {
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  return (
    <TouchableOpacity
      style={recordingActive ? styles.greenLocalButton : styles.localButton}
      onPress={() => setRecordingActive(!recordingActive)}>
      <Image source={{uri: recordingIcon}} style={styles.buttonIcon} />
    </TouchableOpacity>
  );
}

export const recordingIcon =
  'data:image/png;base64,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';