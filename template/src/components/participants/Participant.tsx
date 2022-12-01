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
import React, {useContext, useRef, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import RemoteAudioMute from '../../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../../subComponents/RemoteVideoMute';
import {ClientRole, RenderInterface} from '../../../agora-rn-uikit';
import UserAvatar from '../../atoms/UserAvatar';
import {isWeb, isWebInternal} from '../../utils/common';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import Spacer from '../../atoms/Spacer';
import useRemoteEndCall from '../../utils/useRemoteEndCall';
import {useChatMessages} from '../chat-messages/useChatMessages';
import LocalVideoMute from '../../subComponents/LocalVideoMute';
import {ButtonTemplateName} from '../../utils/useButtonTemplate';
import LocalAudioMute from '../../subComponents/LocalAudioMute';
import RemoveMeetingPopup from '../../subComponents/RemoveMeetingPopup';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import {
  RaiseHandValue,
  LiveStreamContext,
  LiveStreamControlMessageEnum,
} from '../livestream';
import events, {EventPersistLevel} from '../../rtm-events-api';
import IconButton from '../../atoms/IconButton';
import ThemeConfig from '../../theme';
interface ParticipantInterface {
  isLocal: boolean;
  name: string;
  user: RenderInterface;
  showControls: boolean;
  isHostUser: boolean;
  isAudienceUser: boolean;
}

const Participant = (props: ParticipantInterface) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const usercontainerRef = useRef(null);
  const {user, name, showControls, isHostUser, isLocal, isAudienceUser} = props;
  const [pos, setPos] = useState({top: 0, left: 0});
  const [removeMeetingPopupVisible, setRemoveMeetingPopupVisible] =
    useState(false);
  const endRemoteCall = useRemoteEndCall();
  const {openPrivateChat} = useChatMessages();
  const {raiseHandList} = useContext(LiveStreamContext);
  const {
    data: {isHost},
  } = useMeetingInfo();

  const bgContainerStyle = {
    background: $config.CARD_LAYER_5_COLOR + '20',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  };
  const containerStyle = {
    background: $config.PRIMARY_ACTION_BRAND_COLOR + '10',
    width: 36,
    height: 36,
    borderRadius: 18,
  };
  const textStyle = {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 10,
    fontWeight: '400',
    color: $config.FONT_COLOR,
  };

  const renderActionMenu = () => {
    const items: ActionMenuItem[] = [
      {
        icon: 'chat',
        title: 'Message Privately',
        callback: () => {
          setActionMenuVisible(false);
          openPrivateChat(user.uid);
        },
      },
    ];

    if (isHost) {
      items.push({
        icon: 'remoteEndCall',
        title: 'Remove from meeting',
        callback: () => {
          setActionMenuVisible(false);
          setRemoveMeetingPopupVisible(true);
        },
      });
    }

    if (isHost && $config.EVENT_MODE) {
      if (
        raiseHandList[user.uid]?.raised === RaiseHandValue.TRUE &&
        raiseHandList[user.uid]?.role == ClientRole.Broadcaster
      ) {
        items.push({
          icon: 'remoteEndCall',
          title: 'demote to audience',
          callback: () => {
            setActionMenuVisible(false);
            events.send(
              LiveStreamControlMessageEnum.raiseHandRequestRejected,
              '',
              EventPersistLevel.LEVEL1,
              user.uid,
            );
          },
        });
      }
    }

    // {
    //   icon: 'videocam',
    //   title: 'Request Video',
    //   callback: () => console.warn('Request Video'),
    // },
    // {
    //   icon: 'mic',
    //   title: 'Request Mic',
    //   callback: () => console.warn('Request Mic'),
    // },

    return (
      <>
        {isHost ? (
          <RemoveMeetingPopup
            modalVisible={removeMeetingPopupVisible}
            setModalVisible={setRemoveMeetingPopupVisible}
            username={user.name}
            removeUserFromMeeting={() => endRemoteCall(user.uid)}
          />
        ) : (
          <></>
        )}
        <ActionMenu
          actionMenuVisible={actionMenuVisible}
          setActionMenuVisible={setActionMenuVisible}
          modalPosition={{top: pos.top - 20, left: pos.left + 50}}
          items={items}
        />
      </>
    );
  };

  const showModal = () => {
    usercontainerRef.current.ge;
    usercontainerRef?.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setPos({
        top: py + h,
        left: _px,
      });
    });
    setActionMenuVisible((state) => !state);
  };
  return (
    <>
      {!isLocal || isAudienceUser ? renderActionMenu() : <></>}
      <PlatformWrapper showModal={showModal} setIsHovered={setIsHovered}>
        <View style={styles.container} ref={usercontainerRef}>
          <View style={styles.userInfoContainer}>
            <View style={bgContainerStyle}>
              <UserAvatar
                name={name}
                containerStyle={containerStyle}
                textStyle={textStyle}
              />
            </View>
            <View style={{alignSelf: 'center'}}>
              <Text style={styles.participantNameText}>{name}</Text>
              {isHostUser && (
                <Text style={styles.subText}>Host{isLocal ? ', Me' : ''}</Text>
              )}
              {!isHostUser && isLocal && (
                <Text style={styles.subText}>{'Me'}</Text>
              )}
            </View>
          </View>
          {showControls ? (
            <View style={styles.iconContainer}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: $config.CARD_LAYER_5_COLOR + '20',
                  opacity:
                    ((isHovered || actionMenuVisible || !isWebInternal()) &&
                      !isLocal) ||
                    (isHovered && isAudienceUser)
                      ? 1
                      : 0,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 20,
                }}>
                <IconButton
                  iconProps={{
                    name: 'more-menu',
                    iconSize: 'medium',
                  }}
                  onPress={() => {
                    showModal();
                  }}
                />
              </View>
              <Spacer horizontal={true} size={16} />
              {!$config.AUDIO_ROOM &&
                (isLocal
                  ? !isAudienceUser && (
                      <LocalVideoMute iconSize="medium" showLabel={false} />
                    )
                  : !isAudienceUser && (
                      <RemoteVideoMute
                        uid={user.uid}
                        video={user.video}
                        isHost={isHost}
                      />
                    ))}
              <Spacer horizontal={true} size={16} />
              {isLocal
                ? !isAudienceUser && (
                    <LocalAudioMute iconSize="medium" showLabel={false} />
                  )
                : !isAudienceUser && (
                    <RemoteAudioMute
                      uid={user.uid}
                      audio={user.audio}
                      isHost={isHost}
                    />
                  )}
            </View>
          ) : (
            <></>
          )}
        </View>
      </PlatformWrapper>
    </>
  );
};
export default Participant;

const PlatformWrapper = ({children, showModal, setIsHovered}) => {
  return isWeb() ? (
    <div
      style={{}}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    <TouchableOpacity
      onPress={() => {
        showModal();
      }}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  participantNameText: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 15,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexDirection: 'row',
    color: $config.FONT_COLOR,
    textAlign: 'left',
  },
  subText: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled,
    marginTop: 4,
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    flex: 0.7,
  },
  iconContainer: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'center',
  },
});
