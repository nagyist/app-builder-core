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
import React, {useState, useContext, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {PropsContext, ClientRole} from '../../agora-rn-uikit';
import {isValidReactComponent, isWebInternal} from '../utils/common';
import ColorContext from './ColorContext';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import PreCallLogo from './common/Logo';
import {useCustomization} from 'customization-implementation';
import PreCallLocalMute from './precall/LocalMute';
import {
  PreCallJoinBtn,
  PreCallTextInput,
  PreCallMeetingTitle,
  PreCallSelectDevice,
  PreCallVideoPreview,
  PreCallJoinCallBtnProps,
} from './precall/index';
import SDKEvents from '../utils/SdkEvents';
import isSDKCheck from '../utils/isSDK';
import Logo from './common/Logo';
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';
import {useRtc} from 'customization-api';
import {MeetingTitleProps} from './precall/meetingTitle';
import {PreCallTextInputProps} from './precall/textInput';

import StorageContext from './StorageContext';
import DimensionContext from '../components/dimension/DimensionContext';
import ThemeConfig from '../theme';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

const JoinRoomInputView = ({isDesktop}) => {
  const {JoinButton, Textbox} = useCustomization((data) => {
    let components: {
      JoinButton: React.ComponentType<PreCallJoinCallBtnProps>;
      Textbox: React.ComponentType<PreCallTextInputProps>;
    } = {
      Textbox: PreCallTextInput,
      JoinButton: PreCallJoinBtn,
    };
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall === 'object'
    // ) {
    //   if (
    //     data?.components?.precall?.joinButton &&
    //     typeof data?.components?.precall?.joinButton !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.joinButton)) {
    //       components.JoinButton = data?.components?.precall?.joinButton;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.textBox &&
    //     typeof data?.components?.precall?.textBox !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.textBox)) {
    //       components.Textbox = data?.components?.precall?.textBox;
    //     }
    //   }
    // }
    return components;
  });
  return (
    <View
      style={$config.EVENT_MODE ? style.lsBtnContainer : style.btnContainer}>
      <Textbox
        isDesktop={isDesktop}
        labelStyle={$config.EVENT_MODE ? style.labelStyle : {}}
      />
      {$config.EVENT_MODE ? (
        <Text style={style.subTextStyle}>
          Enter the name you would like to join the room as
        </Text>
      ) : (
        <></>
      )}
      <View
        style={
          $config.EVENT_MODE && {justifyContent: 'space-between', flex: 1}
        }>
        <View style={{height: 20}} />
        <View
          style={
            $config.EVENT_MODE && isDesktop
              ? style.btnContainerStyle
              : {width: '100%'}
          }>
          <JoinButton />
        </View>
      </View>
    </View>
  );
};

const JoinRoomName = ({isDesktop}) => {
  const {JoinButton, Textbox} = useCustomization((data) => {
    let components: {
      JoinButton: React.ComponentType<PreCallJoinCallBtnProps>;
      Textbox: React.ComponentType<PreCallTextInputProps>;
    } = {
      Textbox: PreCallTextInput,
      JoinButton: PreCallJoinBtn,
    };
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall === 'object'
    // ) {
    //   if (
    //     data?.components?.precall?.joinButton &&
    //     typeof data?.components?.precall?.joinButton !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.joinButton)) {
    //       components.JoinButton = data?.components?.precall?.joinButton;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.textBox &&
    //     typeof data?.components?.precall?.textBox !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.textBox)) {
    //       components.Textbox = data?.components?.precall?.textBox;
    //     }
    //   }
    // }
    return components;
  });
  return <Textbox isDesktop={isDesktop} />;
};

const JoinRoomButton = () => {
  const {JoinButton, Textbox} = useCustomization((data) => {
    let components: {
      JoinButton: React.ComponentType<PreCallJoinCallBtnProps>;
      Textbox: React.ComponentType;
    } = {Textbox: PreCallTextInput, JoinButton: PreCallJoinBtn};
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall === 'object'
    // ) {
    //   if (
    //     data?.components?.precall?.joinButton &&
    //     typeof data?.components?.precall?.joinButton !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.joinButton)) {
    //       components.JoinButton = data?.components?.precall?.joinButton;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.textBox &&
    //     typeof data?.components?.precall?.textBox !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.textBox)) {
    //       components.Textbox = data?.components?.precall?.textBox;
    //     }
    //   }
    // }
    return components;
  });
  return <JoinButton />;
};

const Precall = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {rtcProps} = useContext(PropsContext);
  const {
    VideoPreview,
    MeetingName,
    DeviceSelect,
    PrecallAfterView,
    PrecallBeforeView,
  } = useCustomization((data) => {
    const components: {
      PrecallAfterView: React.ComponentType;
      PrecallBeforeView: React.ComponentType;
      DeviceSelect: React.ComponentType;
      VideoPreview: React.ComponentType;
      MeetingName: React.ComponentType<MeetingTitleProps>;
    } = {
      PrecallAfterView: React.Fragment,
      PrecallBeforeView: React.Fragment,
      MeetingName: PreCallMeetingTitle,
      VideoPreview: PreCallVideoPreview,
      DeviceSelect: PreCallSelectDevice,
    };
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall === 'object'
    // ) {
    //   if (
    //     data?.components?.precall?.after &&
    //     isValidReactComponent(data?.components?.precall?.after)
    //   ) {
    //     components.PrecallAfterView = data?.components?.precall?.after;
    //   }
    //   if (
    //     data?.components?.precall?.before &&
    //     isValidReactComponent(data?.components?.precall?.before)
    //   ) {
    //     components.PrecallBeforeView = data?.components?.precall?.before;
    //   }

    //   if (
    //     data?.components?.precall?.meetingName &&
    //     typeof data?.components?.precall?.meetingName !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.meetingName)) {
    //       components.MeetingName = data?.components?.precall?.meetingName;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.deviceSelect &&
    //     typeof data?.components?.precall?.deviceSelect !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.deviceSelect)) {
    //       components.DeviceSelect = data?.components?.precall?.deviceSelect;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.preview &&
    //     typeof data?.components?.precall?.preview !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.preview)) {
    //       components.VideoPreview = data?.components?.precall?.preview;
    //     }
    //   }
    // }
    return components;
  });
  const {
    isJoinDataFetched,
    data: {meetingTitle},
  } = useMeetingInfo();
  const rtc = useRtc();
  const isSDK = isSDKCheck();

  const [dim, setDim] = useState<[number, number]>([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ]);

  //permission helper modal show/hide
  const [isVisible, setIsVisible] = useState(false);
  const {store} = useContext(StorageContext);

  useEffect(() => {
    if (isWebInternal() && !isSDK) {
      if (meetingTitle) {
        document.title = meetingTitle + ' | ' + $config.APP_NAME;
      }
    }
  });

  useEffect(() => {
    if (isJoinDataFetched) {
      new Promise((res) =>
        // @ts-ignore
        rtc.RtcEngine.getDevices(function (devices: MediaDeviceInfo[]) {
          res(devices);
        }),
      ).then((devices: MediaDeviceInfo[]) => {
        SDKEvents.emit('preJoin', meetingTitle, devices);
      });
    }
  }, [isJoinDataFetched]);

  useEffect(() => {
    if (store?.permissionPopupSeen) {
      const flag = JSON.parse(store?.permissionPopupSeen);
      if (flag === false) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, []);

  const FpePrecallComponent = useCustomization((data) => {
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall !== 'object'
    // ) {
    //   if (isValidReactComponent(data?.components?.precall)) {
    //     return data?.components?.precall;
    //   }
    //   return undefined;
    // }
    return undefined;
  });

  const onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const isMobileView = dim[0] < dim[1] + 150;
  const isDesktop = !isMobileView;

  if (!isJoinDataFetched) return <Text style={style.titleFont}>Loading..</Text>;
  return FpePrecallComponent ? (
    <FpePrecallComponent />
  ) : (
    <>
      <PrecallBeforeView />
      <View
        style={isDesktop ? style.main : style.mainMobile}
        onLayout={onLayout}
        testID="precall-screen">
        {/* Precall screen only changes for audience in Live Stream event */}
        {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
          isDesktop ? (
            <View>
              <Card>
                <Logo />
                <View style={style.meetingTitleContainer}>
                  <MeetingName textStyle={style.meetingTitleStyle} />
                </View>
                <JoinRoomInputView isDesktop={isDesktop} />
              </Card>
            </View>
          ) : (
            <View style={{flex: 1}}>
              <View style={{alignSelf: 'center'}}>
                <Logo />
              </View>
              <View style={style.meetingTitleContainer}>
                <MeetingName textStyle={style.meetingTitleStyle} />
              </View>
              <View testID="precall-mobile-join" style={{flex: 1}}>
                <JoinRoomInputView isDesktop={isDesktop} />
              </View>
            </View>
          )
        ) : (
          /* Meeting Precall*/
          <>
            <View style={!isDesktop && {alignSelf: 'center'}}>
              <MeetingName
                textStyle={
                  [
                    style.meetingTitleStyle2,
                    {padding: isDesktop ? 32 : 25},
                  ] as object
                }
              />
            </View>
            {isDesktop ? (
              <>
                <View style={[style.container]}>
                  <View
                    testID="precall-preview"
                    style={[style.leftContent, style.boxStyle]}>
                    <VideoPreview />
                  </View>
                  <Card style={style.rightContent}>
                    <View>
                      <MeetingName />
                      <View style={style.rightInputContent}>
                        <JoinRoomName isDesktop={isDesktop} />
                        <Spacer size={32} />
                        <DeviceSelect />
                        <Spacer size={60} />
                        <View style={{width: '100%'}}>
                          <JoinRoomButton />
                        </View>
                      </View>
                    </View>
                  </Card>
                </View>
                <Spacer size={90} />
              </>
            ) : (
              <View style={{flex: 1}}>
                <View style={{flex: 3}} testID="precall-mobile-preview">
                  <VideoPreview />
                </View>
                <View
                  testID="precall-mobile-join"
                  style={{
                    flex: $config.EVENT_MODE ? 2 : 1,
                  }}>
                  <JoinRoomInputView isDesktop={isDesktop} />
                </View>
              </View>
            )}
          </>
        )}
      </View>
      <PrecallAfterView />
    </>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  labelStyle: {
    paddingLeft: 8,
  },
  subTextStyle: {
    marginTop: 8,
    marginLeft: 8,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 18,
    color: $config.FONT_COLOR,
    textAlign: 'left',
  },
  btnContainerStyle: {maxWidth: 337, alignSelf: 'center', marginTop: 50},
  main: {
    flex: 2,
    paddingHorizontal: '10%',
    minHeight: 500,
    justifyContent: 'center',
  },
  mainMobile: {
    flex: 2,
    paddingHorizontal: 16,
  },
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContent: {
    flex: 2.5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  boxStyle: {
    shadowColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['10%'],
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginRight: 24,
    height: '100%',
  },
  mobileBoxStyle: {
    marginRight: 0,
    borderRadius: 20,
    flex: 3,
  },
  rightContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    maxWidth: 450,
  },
  rightInputContent: {
    padding: 32,
    borderTopWidth: 1,
    borderTopColor: $config.CARD_LAYER_3_COLOR,
  },
  titleFont: {
    textAlign: 'center',
    fontSize: 20,
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
  },
  btnContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  lsBtnContainer: {
    flex: 1,
    width: '100%',
    // justifyContent: 'center',
  },
  meetingTitleContainer: {
    marginVertical: 10,
  },
  meetingTitleStyle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '700',
    fontSize: ThemeConfig.FontSize.extraLarge,
    color: $config.FONT_COLOR,
    paddingLeft: 0,
  },
  meetingTitleStyle2: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR,
    paddingLeft: 0,
  },
});

export default Precall;
