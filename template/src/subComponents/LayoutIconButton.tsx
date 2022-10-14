import React, {useContext, useState} from 'react';
import {StyleSheet} from 'react-native';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {BtnTemplate, BtnTemplateInterface} from '../../agora-rn-uikit';

import LayoutIconDropdown from './LayoutIconDropdown';
import useCustomLayout from '../pages/video-call/CustomLayout';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useLayout} from '../utils/useLayout';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import Styles from '../components/styles';

interface LayoutIconButtonInterface {
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const LayoutIconButton = (props: LayoutIconButtonInterface) => {
  const {modalPosition} = props;
  //commented for v1 release
  //const layoutLabel = useString('layoutLabel')('');
  const layoutLabel = 'Layout';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const [showDropdown, setShowDropdown] = useState(false);
  const layouts = useCustomLayout();
  const changeLayout = useChangeDefaultLayout();
  const {activeLayoutName} = useLayout();

  const layout = layouts.findIndex((item) => item.name === activeLayoutName);
  const renderLayoutIcon = (showDropdown?: boolean) => {
    let onPress = () => {};
    let renderContent = [];
    if (!showDropdown) {
      onPress = () => {
        changeLayout();
      };
    } else {
      onPress = () => {
        setShowDropdown(true);
      };
    }
    let btnTemplateProps = {
      onPress: onPress,
      style: {},
      styleText: {},
      btnText: '',
    };
    if (buttonTemplateName === ButtonTemplateName.bottomBar) {
      btnTemplateProps.style = Styles.localButton as Object;
      btnTemplateProps.btnText = layoutLabel;
      btnTemplateProps.styleText = Styles.localButtonText as Object;
    } else {
      btnTemplateProps.style = style.btnHolder;
      delete btnTemplateProps['btnText'];
    }
    renderContent.push(
      props?.render ? (
        props.render(onPress, buttonTemplateName)
      ) : layouts[layout]?.iconName ? (
        <BtnTemplate
          key={'defaultLayoutIconWithName'}
          name={layouts[layout]?.iconName}
          {...btnTemplateProps}
        />
      ) : (
        <BtnTemplate
          key={'defaultLayoutIconWithIcon'}
          icon={layouts[layout]?.icon}
          {...btnTemplateProps}
        />
      ),
    );
    return renderContent;
  };
  return (
    <>
      {/**
       * Based on the flag. it will render the dropdown
       */}
      <LayoutIconDropdown
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        modalPosition={modalPosition}
      />
      {/**
       * If layout contains more than 2 data. it will render the dropdown.
       */}
      {layouts && Array.isArray(layouts) && layouts.length > 1
        ? renderLayoutIcon(true)
        : renderLayoutIcon(false)}
    </>
  );
};

const style = StyleSheet.create({
  btnHolder: {
    marginHorizontal: isMobileOrTablet() ? 2 : 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default LayoutIconButton;
