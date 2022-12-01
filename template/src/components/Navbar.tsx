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
import React, {useContext, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, TextStyle} from 'react-native';
import {Icons} from '../../agora-rn-uikit';
import Settings, {
  SettingsWithViewWrapper,
  SettingsIconButtonProps,
} from './Settings';
import CopyJoinInfo, {CopyJoinInfoProps} from '../subComponents/CopyJoinInfo';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import ChatContext from '../components/ChatContext';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import LiveStreamContext from './livestream';
import {numFormatter} from '../utils/index';
import {useLayout} from '../utils/useLayout';
import {useChatNotification} from '../components/chat-notification/useChatNotification';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {
  isAndroid,
  isIOS,
  isValidReactComponent,
  isWebInternal,
} from '../utils/common';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useRecording} from '../subComponents/recording/useRecording';
import LayoutIconDropdown from '../subComponents/LayoutIconDropdown';
import DimensionContext from './dimension/DimensionContext';
import {useString} from '../utils/useString';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useSidePanel} from '../utils/useSidePanel';
import {useChatUIControl} from './chat-ui/useChatUIControl';
import LayoutIconButton from '../subComponents/LayoutIconButton';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import Styles from './styles';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';

const RenderSeparator = () => {
  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop} = getDimensionData();
  return isWebInternal() && isDesktop ? (
    <View style={style.navItem}>
      <View style={style.navItemSeparator}></View>
    </View>
  ) : (
    <View style={{marginHorizontal: 2}}></View>
  );
};

const ParticipantsCountView = () => {
  const {onlineUsersCount} = useContext(ChatContext);

  return (
    <>
      {onlineUsersCount !== 0 && (
        <View style={[style.navItem, {justifyContent: 'center'}]}>
          <View style={style.chip}>
            {onlineUsersCount > 0 && (
              <Text style={style.chipText}>
                {numFormatter(onlineUsersCount)}
              </Text>
            )}
          </View>
        </View>
      )}
    </>
  );
};

interface ParticipantsIconButtonProps {
  liveStreamingRequestAlertIconPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  render?: (onPress: () => void, isPanelActive: boolean) => JSX.Element;
}
export const ParticipantsIconButton = (props: ParticipantsIconButtonProps) => {
  const {
    liveStreamingRequestAlertIconPosition = {
      top: isWebInternal() ? -10 : 2,
      left: undefined,
      right: undefined,
      bottom: undefined,
    },
  } = props;
  const {sidePanel, setSidePanel} = useSidePanel();
  const {isPendingRequestToReview, setLastCheckedRequestTimestamp} =
    useContext(LiveStreamContext);
  //commented for v1 release
  //const participantsLabel = useString('participantsLabel')();
  const {onlineUsersCount} = useContext(ChatContext);
  const participantsLabel = `Participants (${numFormatter(onlineUsersCount)})`;
  const isPanelActive = sidePanel === SidePanelType.Participants;

  const onPress = () => {
    isPanelActive
      ? setSidePanel(SidePanelType.None)
      : setSidePanel(SidePanelType.Participants);
    $config.EVENT_MODE && $config.RAISE_HAND;
    setLastCheckedRequestTimestamp(new Date().getTime());
  };
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,
    iconProps: {
      name: 'participants',
      tintColor: isPanelActive
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.PRIMARY_ACTION_BRAND_COLOR,
    },
  };

  iconButtonProps.style = Styles.localButton as Object;
  iconButtonProps.btnText = participantsLabel;
  iconButtonProps.styleText = {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    marginTop: 4,
    fontWeight: isPanelActive ? '700' : '400',
    color: isPanelActive
      ? $config.PRIMARY_ACTION_TEXT_COLOR
      : $config.PRIMARY_ACTION_BRAND_COLOR,
  };

  return props?.render ? (
    props.render(onPress, isPanelActive)
  ) : (
    <>
      <View
        style={[
          style.navItem,
          {
            backgroundColor: isPanelActive
              ? $config.PRIMARY_COLOR
              : 'transparent',
          },
        ]}>
        <IconButton {...iconButtonProps} />
      </View>
      {/* {$config.EVENT_MODE && $config.RAISE_HAND && isPendingRequestToReview && (
        <View
          style={{
            position: 'absolute',
            top: liveStreamingRequestAlertIconPosition.top,
            bottom: liveStreamingRequestAlertIconPosition.bottom,
            right: liveStreamingRequestAlertIconPosition.right,
            left: liveStreamingRequestAlertIconPosition.left,
          }}>
          <View style={[style.badge, {paddingHorizontal: 3}]}>
            <ImageIcon
              icon={Icons['exclamationIcon']}
              color={$config.SECONDARY_FONT_COLOR}
            />
          </View>
        </View>
      )} */}
    </>
  );
};

interface ChatIconButtonProps {
  badgeContainerPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  badgeTextStyle?: TextStyle;
  render?: (
    onPress: () => void,
    isPanelActive: boolean,
    totalUnreadCount: number,
  ) => JSX.Element;
}

export const ChatIconButton = (props: ChatIconButtonProps) => {
  const {sidePanel, setSidePanel} = useSidePanel();
  const {
    badgeContainerPosition = {
      top: 2,
      left: 35,
      right: undefined,
      bottom: undefined,
      zIndex: 999,
    },
    badgeTextStyle = {
      color:
        sidePanel === SidePanelType.Chat
          ? $config.PRIMARY_ACTION_BRAND_COLOR
          : $config.PRIMARY_ACTION_TEXT_COLOR,
      fontSize: 12,
      textAlign: 'center',
    },
  } = props;
  const {setUnreadGroupMessageCount, totalUnreadCount} = useChatNotification();
  const {setGroupActive, setPrivateActive, setSelectedChatUserId} =
    useChatUIControl();

  //commented for v1 release
  //const chatLabel = useString('chatLabel')();
  const chatLabel = 'Chat';
  const isPanelActive = sidePanel === SidePanelType.Chat;
  const onPress = () => {
    if (isPanelActive) {
      setSidePanel(SidePanelType.None);
      setGroupActive(false);
      setPrivateActive(false);
      setSelectedChatUserId(0);
    } else {
      setUnreadGroupMessageCount(0);
      setGroupActive(true);
      setSidePanel(SidePanelType.Chat);
    }
  };
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,
    iconProps: {
      name: 'chat',
      tintColor: isPanelActive
        ? $config.PRIMARY_ACTION_TEXT_COLOR
        : $config.PRIMARY_ACTION_BRAND_COLOR,
    },
  };

  iconButtonProps.style = Styles.localButton as Object;
  iconButtonProps.btnText = chatLabel;
  iconButtonProps.styleText = {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    marginTop: 4,
    fontWeight: isPanelActive ? '700' : '400',
    color: isPanelActive
      ? $config.PRIMARY_ACTION_TEXT_COLOR
      : $config.PRIMARY_ACTION_BRAND_COLOR,
  };

  const renderBadge = (badgeCount: any) => {
    return (
      <View
        style={{
          position: 'absolute',
          top: badgeContainerPosition?.top,
          bottom: badgeContainerPosition?.bottom,
          left: badgeContainerPosition?.left,
          right: badgeContainerPosition?.right,
          borderRadius: 10,
          width: 20,
          height: 20,
          backgroundColor:
            sidePanel === SidePanelType.Chat
              ? $config.PRIMARY_ACTION_TEXT_COLOR
              : $config.PRIMARY_ACTION_BRAND_COLOR,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            ...badgeTextStyle,
          }}>
          {numFormatter(badgeCount)}
        </Text>
      </View>
    );
  };
  return props?.render ? (
    props.render(onPress, isPanelActive, totalUnreadCount)
  ) : (
    <>
      <View
        style={[
          style.navItem,
          {
            backgroundColor: isPanelActive
              ? $config.PRIMARY_COLOR
              : 'transparent',
          },
        ]}>
        <IconButton {...iconButtonProps} />
        {totalUnreadCount !== 0 && renderBadge(totalUnreadCount)}
      </View>
    </>
  );
};

interface LayoutIconButtonProps {
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };

  render?: (onPress: () => void) => JSX.Element;
}

const SettingsIconButton = (props: SettingsIconButtonProps) => {
  return <Settings {...props} />;
};
const SettingsIconButtonWithWrapper = (props: SettingsIconButtonProps) => {
  return <SettingsWithViewWrapper {...props} />;
};

const Navbar = () => {
  //commented for v1 release
  //const recordingLabel = useString('recordingLabel')();
  const recordingLabel = 'Recording';
  const {
    data: {meetingTitle},
  } = useMeetingInfo();

  const {isRecordingActive} = useRecording();
  const {getDimensionData} = useContext(DimensionContext);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isDesktop = dim[0] > 1224;

  const [showIcon, setShowIcon] = useState(true);
  React.useEffect(() => {
    // Change the state every second or the time given by User.
    const interval = setInterval(() => {
      setShowIcon((showIcon) => !showIcon);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      testID="videocall-topbar"
      onLayout={onLayout}
      style={[
        isWebInternal() ? style.navHolder : style.navHolderNative,
        {paddingHorizontal: isDesktop ? 30 : 10},
      ]}>
      <View testID="videocall-meetingName" style={style.roomNameContainer}>
        <Text style={style.roomNameText} numberOfLines={1} ellipsizeMode="tail">
          {meetingTitle}
        </Text>
        {isRecordingActive && !isMobileOrTablet() ? (
          <View style={[style.recordingView]}>
            <View
              style={[style.recordingStatus, {opacity: showIcon ? 1 : 0}]}
            />
            <Text style={style.recordingText}>{recordingLabel}</Text>
          </View>
        ) : (
          <></>
        )}
      </View>
      <View style={style.navControlBar} testID="videocall-navcontrols">
        <View testID="videocall-participantsicon">
          <ParticipantsIconButton />
        </View>
        {$config.CHAT && (
          <View testID="videocall-chaticon">
            <ChatIconButton />
          </View>
        )}
        <View testID="videocall-settingsicon">
          <SettingsIconButtonWithWrapper />
        </View>
      </View>
    </View>
  );
};
type NavBarComponentsArrayProps = [
  (props: CopyJoinInfoProps) => JSX.Element,
  () => JSX.Element,
  (props: ParticipantsIconButtonProps) => JSX.Element,
  (props: ChatIconButtonProps) => JSX.Element,
  (props: LayoutIconButtonProps) => JSX.Element,
  (props: SettingsIconButtonProps) => JSX.Element,
];
export const NavBarComponentsArray: NavBarComponentsArrayProps = [
  CopyJoinInfo,
  ParticipantsCountView,
  ParticipantsIconButton,
  ChatIconButton,
  LayoutIconButton,
  SettingsIconButton,
];

const style = StyleSheet.create({
  navHolder: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navHolderNative: {
    position: 'relative',
    width: '100%',
    height: '8%',
    backgroundColor: $config.SECONDARY_FONT_COLOR + '80',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  recordingView: {
    height: 36,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FF414D' + '10',
    marginLeft: 8,
  },
  recordingText: {
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    color: '#ff414D',
  },
  recordingStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF414D',
    marginRight: 8,
  },
  recordingIcon: {
    width: 20,
    height: 20,
    margin: 1,
    resizeMode: 'contain',
  },
  btnHolder: {
    marginHorizontal: isMobileOrTablet() ? 2 : 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  btnHolderCustom: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  roomNameContainer: {
    zIndex: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomNameText: {
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  chip: {
    backgroundColor: $config.PRIMARY_COLOR,
    borderRadius: 2.5,
    paddingHorizontal: 5,
    marginLeft: 5,
    marginRight: 0,
    paddingVertical: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: isIOS() ? 'Helvetica' : 'sans-serif',
    fontSize: 12,
    color: $config.SECONDARY_FONT_COLOR,
  },
  navControlBar: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 9,
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: isWebInternal()
      ? $config.SECONDARY_FONT_COLOR
      : $config.SECONDARY_FONT_COLOR + '00',
    paddingVertical: 4,
    paddingHorizontal: isMobileOrTablet() ? 0 : 10,
    minHeight: 35,
    borderRadius: 10,
  },
  navItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  navSmItem: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '15%',
  },
  navItemSeparator: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: 1,
    height: '100%',
    marginHorizontal: 10,
    alignSelf: 'center',
    opacity: 0.8,
  },
  navItemSeparatorHorizontal: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: '100%',
    height: 1,
    marginVertical: 10,
    alignSelf: 'center',
    opacity: 0.8,
  },
  dropdownIconContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  separaterContainer: {
    flex: 0.5,
    paddingHorizontal: 5,
  },
  dropdownContainer: {
    position: 'absolute',
    marginTop: 5,
    width: 40,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
  },
});

export default Navbar;
