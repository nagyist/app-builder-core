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
import React, {useState, useContext} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useHistory} from '../components/Router';
//import Logo from '../subComponents/Logo';
import Logo from '../components/common/Logo';
import Spacer from '../atoms/Spacer';
import {
  isMobileUA,
  isValidReactComponent,
  shouldAuthenticate,
  useHasBrandLogo,
} from '../utils/common';
import LogoutButton from '../subComponents/LogoutButton';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import HorizontalRule from '../atoms/HorizontalRule';
import TextInput from '../atoms/TextInput';
import Error from '../subComponents/Error';
import {useString} from '../utils/useString';
import {useCustomization} from 'customization-implementation';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import {RoomInfoDefaultValue} from '../components/room-info/useRoomInfo';
import Card from '../atoms/Card';
import Input from '../atoms/Input';
import LinkButton from '../atoms/LinkButton';
import Toast from '../../react-native-toast-message';
import useJoinRoom from '../utils/useJoinRoom';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import ThemeConfig from '../theme';
import IDPLogoutComponent from '../auth/IDPLogoutComponent';

const isLiveStream = $config.EVENT_MODE;
const mobileOrTablet = isMobileOrTablet();

const Join = () => {
  const hasBrandLogo = useHasBrandLogo();

  const roomId = useString('roomId')();
  const streamId = useString('streamId')();
  const enterRoomId = useString('enterRoomId')();
  const enterStreamId = useString('enterStreamId')();
  const joinRoom = useString('joinRoom')();
  const joinStream = useString('joinStream')();
  const createStream = useString('createStream')();
  const createRoom = useString('createRoom')();

  //toast
  const invalidRoomIdToastHeading = useString('invalidRoomIdToastHeading')();
  const invalidRoomIdToastSubheading = useString(
    'invalidRoomIdToastSubheading',
  )();

  const meetingIdInputPlaceholder = isLiveStream ? enterStreamId : enterRoomId;
  const enterMeetingButton = isLiveStream ? joinStream : joinRoom;
  const createMeetingButton = isLiveStream ? createStream : createRoom;

  const history = useHistory();
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState<null | {name: string; message: string}>(
    null,
  );

  const useJoin = useJoinRoom();
  const {setRoomInfo} = useSetRoomInfo();
  const createMeeting = () => {
    history.push('/create');
  };

  const startCall = async () => {
    useJoin(phrase)
      .then(() => {
        setRoomInfo(RoomInfoDefaultValue);
        history.push(phrase);
      })

      .catch(error => {
        const isInvalidUrl =
          error?.message.toLowerCase().trim() === 'invalid passphrase' || false;
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: isInvalidUrl
            ? invalidRoomIdToastHeading
            : 'Some Error Occured.',
          text2: isInvalidUrl
            ? invalidRoomIdToastSubheading
            : 'Please try again',
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
      });
  };
  const {JoinComponent} = useCustomization(data => {
    let components: {
      JoinComponent?: React.ComponentType;
    } = {};
    // commented for v1 release
    // if (
    //   data?.components?.join &&
    //   typeof data?.components?.join !== 'object' &&
    //   isValidReactComponent(data?.components?.join)
    // ) {
    //   components.JoinComponent = data?.components?.join;
    // }
    return components;
  });

  return JoinComponent ? (
    <JoinComponent />
  ) : (
    <View style={style.root}>
      {!isMobileUA() ? (
        <IDPLogoutComponent containerStyle={{marginBottom: -100}} />
      ) : (
        <></>
      )}
      <ScrollView contentContainerStyle={style.main}>
        {error ? <Error error={error} /> : <></>}
        <Card>
          <View>
            <View style={style.logoContainerStyle}>
              <Logo />
              {isMobileUA() ? (
                <IDPLogoutComponent
                  containerStyle={{marginTop: 0, marginRight: 0}}
                />
              ) : (
                <></>
              )}
            </View>
            <Spacer size={20} />
            <Text style={style.heading}>
              {isLiveStream ? joinStream : joinRoom}
            </Text>
            <Spacer size={40} />
            <Input
              labelStyle={style.labelStyle}
              label={isLiveStream ? streamId : roomId}
              autoFocus
              value={phrase}
              placeholder={meetingIdInputPlaceholder}
              onChangeText={text => setPhrase(text)}
              onSubmitEditing={() => startCall()}
            />
            <Spacer size={60} />
          </View>
          <View style={style.btnContainer}>
            <PrimaryButton
              iconName="video-on"
              disabled={phrase === ''}
              onPress={() => startCall()}
              text={enterMeetingButton}
              containerStyle={isMobileUA() && {width: '100%'}}
            />
            <Spacer size={16} />
            <LinkButton
              text={createMeetingButton}
              onPress={() => createMeeting()}
            />
            {shouldAuthenticate ? (
              <LogoutButton
                //@ts-ignore
                setError={setError}
              /> //setError not available in logout?
            ) : (
              <></>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  logoContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  labelStyle: {
    paddingLeft: 8,
  },
  root: {
    flex: 1,
  },
  main: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heading: {
    fontSize: ThemeConfig.FontSize.extraLarge,
    fontWeight: '700',
    lineHeight: ThemeConfig.FontSize.extraLarge,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});

export default Join;
