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
import React from 'react';
import {
  BtnTemplate,
  ToggleState,
  BtnTemplateInterface,
  PermissionState,
} from '../../agora-rn-uikit';
import useMuteToggleLocal, {MUTE_LOCAL_TYPE} from '../utils/useMuteToggleLocal';
import Styles from '../components/styles';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {useString} from '../utils/useString';
import {useLocalUserInfo} from 'customization-api';
/**
 * A component to mute / unmute the local audio
 */
export interface LocalAudioMuteProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isAudioEnabled: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

function LocalAudioMute(props: LocalAudioMuteProps) {
  const local = useLocalUserInfo();
  const localMute = useMuteToggleLocal();
  //commented for v1 release
  //const audioLabel = useString('toggleAudioButton')();

  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;

  const onPress = () => {
    localMute(MUTE_LOCAL_TYPE.audio);
  };
  const isAudioEnabled = local.audio === ToggleState.enabled;
  const audioLabel = isAudioEnabled ? 'Mute' : 'Unmute';

  const permissionDenied =
    local.permissionStatus === PermissionState.REJECTED ||
    local.permissionStatus === PermissionState.GRANTED_FOR_CAM_ONLY;
  let btnTemplateProps: BtnTemplateInterface = {
    onPress: onPress,
    //name: isAudioEnabled ? 'mic' : 'micOff',
    name: permissionDenied
      ? 'micNotAvaiable'
      : isAudioEnabled
      ? 'micOn'
      : 'micOff',
    disabled: permissionDenied ? true : false,
    styleIcon: {
      width: 24,
      height: 24,
    },
  };
  btnTemplateProps.styleText = {
    fontFamily: 'Source Sans Pro',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: permissionDenied
      ? '#8F8F8F'
      : isAudioEnabled
      ? $config.PRIMARY_COLOR
      : '#FF414D',
  };
  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.actionSheetButton as Object;
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.btnText = audioLabel;
  }

  return props?.render ? (
    props.render(onPress, isAudioEnabled, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
}

export default LocalAudioMute;
