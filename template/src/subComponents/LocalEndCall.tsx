import React, {useContext} from 'react';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {
  BtnTemplate,
  BtnTemplateInterface,
  ImageIcon,
} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {View, Text, TouchableOpacity} from 'react-native';
import {useRtc} from 'customization-api';

export interface LocalEndcallProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useRtc();
  //commented for v1 release
  //const endCallLabel = useString('endCallButton')();
  const endCallLabel = 'End';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const isTopBarTemplate = buttonTemplateName === ButtonTemplateName.topBar;
  const onPress = () =>
    dispatch({
      type: 'EndCall',
      value: [],
    });
  return props?.render ? (
    props.render(onPress, buttonTemplateName)
  ) : (
    <TouchableOpacity
      style={Styles.endCallContainer as object}
      onPress={onPress}>
      <ImageIcon
        style={{
          width: 20,
          height: 20,
        }}
        name={'endCall'}
      />
      <Text style={Styles.endCallText as object}>{endCallLabel}</Text>
    </TouchableOpacity>
  );
};
export default LocalEndcall;
