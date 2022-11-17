/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useEffect, useState} from 'react';
import {BtnTemplate, BtnTemplateInterface} from '../../agora-rn-uikit';
import {useRecording} from './recording/useRecording';
import {useString} from '../utils/useString';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import Styles from '../components/styles';
import RecordingPopup from './RecordingPopup';

export interface RecordingButtonProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isRecordingActive: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const Recording = (props: RecordingButtonProps) => {
  const {startRecording, stopRecording, isRecordingActive} = useRecording();
  //commented for v1 release
  //const recordingButton = useString<boolean>('recordingButton');
  const recordingButton = (recording: boolean) =>
    recording ? 'Stop Record' : 'Start Record';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const [modalVisible, setModalVisible] = useState(false);

  const doStopRecording = () => {
    if (isRecordingActive) {
      stopRecording && stopRecording();
      setModalVisible(false);
    }
  };

  const onPress = () => {
    if (!isRecordingActive) {
      startRecording && startRecording();
    } else {
      setModalVisible(true);
    }
  };
  let btnTemplateProps: BtnTemplateInterface = {
    name: isRecordingActive ? 'recordingStop' : 'recordingStart',
    onPress,
    styleIcon: {
      width: 24,
      height: 24,
    },
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.actionSheetButton as Object;
  } else {
    btnTemplateProps.btnText = recordingButton(isRecordingActive);
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.styleText = {
      fontFamily: 'Source Sans Pro',
      fontSize: 12,
      marginTop: 4,
      fontWeight: '400',
      color: isRecordingActive ? '#FF414D' : '#099DFD',
    };
  }

  return props?.render ? (
    props.render(onPress, isRecordingActive, buttonTemplateName)
  ) : (
    <>
      <RecordingPopup
        stopRecording={doStopRecording}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <BtnTemplate {...btnTemplateProps} />
    </>
  );
};

export default Recording;
