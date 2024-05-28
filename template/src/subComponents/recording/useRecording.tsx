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
import React, {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import Toast from '../../../react-native-toast-message';
import {createHook} from 'customization-implementation';
import {useString} from '../../utils/useString';
import ChatContext from '../../components/ChatContext';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventActions, EventNames} from '../../rtm-events';
import {useContent} from 'customization-api';
import {trimText} from '../../utils/common';
import {useRoomInfo} from 'customization-api';
import StorageContext from '../../components/StorageContext';
import {useSidePanel} from '../../utils/useSidePanel';
import {useCaption} from '../caption/useCaption';
import {SidePanelType} from '../SidePanelEnum';
import {
  ChatType,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {useIsRecordingBot} from './useIsRecordingBot';
import {
  videoRoomRecordingToastHeading,
  videoRoomRecordingToastSubHeading,
  videoRoomUserFallbackText,
  videoRoomRecordingStartErrorToastHeading,
  videoRoomRecordingStopErrorToastHeading,
  videoRoomRecordingErrorToastSubHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {getOriginURL} from '../../auth/config';
import useRecordingLayoutQuery from './useRecordingLayoutQuery';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import {useLiveStreamDataContext} from '../../components/contexts/LiveStreamDataContext';
import {fetchRetry} from '../../utils/fetch-retry';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

const log = (...args: any[]) => {
  console.log('[Recording_v2:] ', ...args);
};

const getFrontendUrl = (url: string) => {
  // check if it doesn't contains the https protocol
  if (url.indexOf('https://') !== 0) {
    url = `https://${url}`;
  }
  return url;
};

interface RecordingsData {
  recordings: [];
  pagination: {};
}
export interface RecordingContextInterface {
  startRecording: () => void;
  stopRecording: () => void;
  isRecordingActive: boolean;
  inProgress: boolean;
  fetchRecordings?: (page: number) => Promise<RecordingsData>;
}

const RecordingContext = createContext<RecordingContextInterface>({
  startRecording: () => {},
  stopRecording: async () => {},
  isRecordingActive: false,
  inProgress: false,
});

/**
 * Component to start / stop Agora cloud recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */
function usePrevious<T = any>(value: any) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

interface RecordingProviderProps {
  children: React.ReactNode;
  value: {
    setRecordingActive: React.Dispatch<SetStateAction<boolean>>;
    isRecordingActive: boolean;
    callActive: boolean;
  };
}

/**
 * Component to start / stop Agora cloud and web recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */

const recordingMode = $config.RECORDING_MODE || 'MIX';

const RecordingProvider = (props: RecordingProviderProps) => {
  const {setRecordingActive, isRecordingActive, callActive} = props?.value;
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  const [inProgress, setInProgress] = useState(false);
  const [uidWhoStarted, setUidWhoStarted] = useState(0);
  const {defaultContent} = useContent();
  const {hostUids} = useLiveStreamDataContext();

  const prevRecordingState = usePrevious<{isRecordingActive: boolean}>({
    isRecordingActive,
  });
  const recordingStartedText = useString<boolean>(
    videoRoomRecordingToastHeading,
  );
  const subheading = useString(videoRoomRecordingToastSubHeading);

  const headingStartError = useString(
    videoRoomRecordingStartErrorToastHeading,
  )();
  const headingStopError = useString(videoRoomRecordingStopErrorToastHeading)();
  const subheadingError = useString(videoRoomRecordingErrorToastSubHeading)();

  const userlabel = useString(videoRoomUserFallbackText)();

  const {localUid, hasUserJoinedRTM} = useContext(ChatContext);
  const {store} = React.useContext(StorageContext);

  const {setChatType} = useChatUIControls();
  const {setSidePanel} = useSidePanel();
  const {setIsCaptionON} = useCaption();
  const {executePresenterQuery, executeNormalQuery} = useRecordingLayoutQuery();
  const {screenShareData} = useScreenContext();
  const stopAPICalledByBotOnce = useRef<boolean>(false);
  const {isRecordingBot, recordingBotUIConfig} = useIsRecordingBot();

  const showErrorToast = (text1: string, text2?: string) => {
    Toast.show({
      leadingIconName: 'alert',
      type: 'error',
      text1: text1,
      text2: text2 ? text2 : '',
      visibilityTime: 3000,
      primaryBtn: null,
      secondaryBtn: null,
      leadingIcon: null,
    });
  };

  useEffect(() => {
    /**
     * The below check makes sure the notification is triggered
     * only once. In native apps, this componenet is mounted everytime
     * when chat icon is toggle, as Controls component is hidden and
     * shown
     */
    if (prevRecordingState) {
      if (prevRecordingState?.isRecordingActive === isRecordingActive) {
        return;
      }

      if ($config.ENABLE_WAITING_ROOM && !isHost && !callActive) {
        return;
      }

      Toast.show({
        leadingIconName: 'recording',
        type: 'info',
        text1: recordingStartedText(isRecordingActive),
        text2: isRecordingActive
          ? subheading(
              trimText(defaultContent[uidWhoStarted]?.name) || userlabel,
            )
          : '',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    }
  }, [isRecordingActive, callActive, isHost]);

  const startRecording = () => {
    log('start recording API called');
    logger.log(
      LogSource.NetworkRest,
      'recording_start',
      'start recording API called',
    );
    const passphrase = roomId.host || '';
    let url = '';
    if (recordingMode === 'WEB') {
      let recordinghostURL = getOriginURL();
      // let recordinghostURL =
      //   'https://app-builder-core-git-hotfix-recording-bot-ends-r-253634-agoraio.vercel.app';
      if (inProgress) {
        console.error(
          'web-recording - start recording API already in progress',
        );
        return;
      }
      if (recordinghostURL.includes('localhost')) {
        console.error(
          'web-recording - Recording url cannot be localhost. It should be a valid deployed URL',
        );
        return;
      }
      recordinghostURL = getFrontendUrl(recordinghostURL);
      url = `${recordinghostURL}/${passphrase}`;
    }
    setInProgress(true);
    logger.debug(
      LogSource.NetworkRest,
      'recording_start',
      'Trying to start recording',
      {
        passphrase: roomId.host,
        url,
        mode: recordingMode,
      },
    );
    fetch(`${$config.BACKEND_ENDPOINT}/v1/recording/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        url,
        webpage_ready_timeout: 10,
        encryption: $config.ENCRYPTION_ENABLED,
        mode: recordingMode.toLowerCase(),
      }),
    })
      .then((res: any) => {
        if (res.status === 200) {
          logger.debug(
            LogSource.NetworkRest,
            'recording_start',
            'start recording successfully',
            res,
          );
          /**
           * 1. Once the backend sucessfuly starts recording, send message
           * in the channel indicating that cloud/web recording is now active.
           */
          events.send(
            EventNames.RECORDING_ATTRIBUTE,
            JSON.stringify({
              action: EventActions.RECORDING_STARTED_BY,
              value: `${localUid}`,
            }),
            PersistanceLevel.Session,
          );
          // 2. set the local recording state to true to update the UI
          setUidWhoStarted(localUid);
          // 3. Check if recording mode is cloud
          if (recordingMode === 'MIX') {
            setInProgress(false);
            setRecordingActive(true);
            // 3.a  Set the presenter mode if screen share is active
            // 3.b Get the most recent screenshare uid
            const sorted = Object.entries(screenShareData)
              .filter(el => el[1]?.ts && el[1].ts > 0 && el[1]?.isActive)
              .sort((a, b) => b[1].ts - a[1].ts);

            const activeScreenshareUid = sorted.length > 0 ? sorted[0][0] : 0;
            if (activeScreenshareUid) {
              log(
                'screenshare: Executing presenter query for screenuid',
                activeScreenshareUid,
              );
              executePresenterQuery(parseInt(activeScreenshareUid));
            } else {
              executeNormalQuery();
            }
          }
        } else if (res.status === 500) {
          setInProgress(false);
          showErrorToast(headingStartError, subheadingError);
        } else {
          setInProgress(false);
          showErrorToast(headingStartError);
        }
      })
      .catch(err => {
        logger.error(
          LogSource.NetworkRest,
          'recording_start',
          'Error while start recording',
          err,
        );
        setInProgress(false);
      });
  };

  const _stopRecording = useCallback(async () => {
    /**
     * Any host in the channel can stop recording.
     */
    logger.debug(LogSource.Internals, 'RECORDING', 'stop recording API called');
    if (inProgress) {
      logger.error(
        LogSource.Internals,
        'RECORDING',
        'stop recording already in progress. Aborting..',
      );
      return;
    }
    setInProgress(true);
    fetchRetry(`${$config.BACKEND_ENDPOINT}/v1/recording/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        mode: recordingMode.toLowerCase(),
      }),
    })
      .then(res => {
        // Bot when stops the recording, it does not reach here
        setInProgress(false);
        if (res.status === 200 || res.status === 202) {
          logger.debug(
            LogSource.NetworkRest,
            'recording_stop',
            'stop recording successfull',
            res,
          );
          /**
           * 1. Once the backend sucessfuly stops recording, send message
           * in the channel indicating that cloud recording is now inactive.
           */
          log('Recording-bot: recording stopped successfully');
          events.send(
            EventNames.RECORDING_ATTRIBUTE,
            JSON.stringify({
              action: EventActions.RECORDING_STOPPED,
              value: 'success',
            }),
            PersistanceLevel.Session,
          );
          // 2. set the local recording state to false to update the UI
          setRecordingActive(false);
        } else if (res.status === 500) {
          logger.error(
            LogSource.NetworkRest,
            'recording_stop',
            'Error while stopping recording',
            res,
          );
          showErrorToast(headingStopError, subheadingError);
          throw Error(`Internal server error ${res.status}`);
        } else {
          logger.error(
            LogSource.NetworkRest,
            'recording_stop',
            'Error while stopping recording',
            res,
          );
          showErrorToast(headingStopError);
          // return Promise.reject(res);
          throw Error(`Internal server error ${res.status}`);
        }
      })
      .catch(err => {
        setRecordingActive(false);
        setInProgress(false);
        log('stop recording', err);
        events.send(
          EventNames.RECORDING_ATTRIBUTE,
          JSON.stringify({
            action: EventActions.RECORDING_STOPPED,
            value: 'error',
          }),
          PersistanceLevel.Session,
        );
      });
  }, [
    headingStopError,
    inProgress,
    roomId.host,
    setRecordingActive,
    store.token,
    subheadingError,
  ]);

  const stopRecording = useCallback(() => {
    if (recordingMode === 'WEB') {
      log('Stopping recording by sending event to bot');
      // send stop request to bot
      setInProgress(true);
      events.send(
        EventNames.RECORDING_ATTRIBUTE,
        JSON.stringify({
          action: EventActions.REQUEST_TO_STOP_RECORDING,
          value: '',
        }),
        PersistanceLevel.Session,
        100000, // bot uid
      );
    } else {
      log('Stopping recording by calling stop');
      _stopRecording();
    }
  }, [_stopRecording]);

  const fetchRecordings = useCallback(
    (page: number) => {
      logger.log(
        LogSource.NetworkRest,
        'recordings_get',
        'Trying to fetch recordings',
        {
          passphrase: roomId?.host,
          limit: 10,
          page,
        },
      );
      return fetch(`${$config.BACKEND_ENDPOINT}/v1/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
        },
        body: JSON.stringify({
          passphrase: roomId?.host,
          limit: 10,
          page,
        }),
      }).then(async response => {
        const data = await response.json();
        if (response.ok) {
          logger.log(
            LogSource.NetworkRest,
            'recordings_get',
            'fetch recordings successfull',
            data,
          );
          if (data) {
            return data;
          } else {
            return Promise.reject(
              new Error(
                `No recordings found for meeting Id: "${roomId?.host}"`,
              ),
            );
          }
        } else {
          const error = {
            message: data?.error?.message,
          };
          logger.error(
            LogSource.NetworkRest,
            'recordings_get',
            'Error while fetching recording',
            error,
          );
          return Promise.reject(error);
        }
      });
    },
    [roomId?.host, store.token],
  );

  // Events
  useEffect(() => {
    events.on(EventNames.RECORDING_ATTRIBUTE, data => {
      log('recording attribute received', data);
      const payload = JSON.parse(data.payload);
      const action = payload.action;
      const value = payload.value;
      switch (action) {
        case EventActions.RECORDING_STARTED_BY:
          setUidWhoStarted(parseInt(value));
          if (recordingMode === 'MIX') {
            setRecordingActive(true);
          }
          break;
        case EventActions.RECORDING_STARTED:
          setInProgress(false);
          setRecordingActive(true);
          break;
        case EventActions.RECORDING_STOPPED:
          setInProgress(false);
          setRecordingActive(false);
          break;
        case EventActions.REQUEST_TO_STOP_RECORDING:
          _stopRecording();
          break;
        default:
          break;
      }
    });
    return () => {
      events.off(EventNames.RECORDING_ATTRIBUTE);
    };
  }, [
    roomId.host,
    setRecordingActive,
    uidWhoStarted,
    localUid,
    _stopRecording,
  ]);
  // ************ Recording Bot starts ************

  const setRecordingBotUI = () => {
    if (isRecordingBot) {
      if (recordingBotUIConfig?.chat && $config.CHAT) {
        setSidePanel(SidePanelType.Chat);
        setChatType(ChatType.Group);
      }
      if (recordingBotUIConfig.stt && $config.ENABLE_STT) {
        setIsCaptionON(true);
      }
    }
  };

  useEffect(() => {
    if (callActive) {
      setRecordingBotUI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callActive]);

  useEffect(() => {
    /**
     * The below piece of code is executed only for recording bot
     * If all the members have left the call and recording is still active -
     * bot will call the stop recording API
     */
    if (!isRecordingBot) {
      return;
    }
    let timer = null;
    const shouldStopRecording = () =>
      isRecordingBot && !hostUids?.length && !stopAPICalledByBotOnce.current;

    log('Recording-bot: Checking if bot should stop recording', {
      shouldStopRecording: shouldStopRecording(),
      isRecordingBot: isRecordingBot,
      areHostsInChannel: hostUids?.length,
      stopAPIcalled: stopAPICalledByBotOnce.current,
    });
    if (shouldStopRecording()) {
      logger.log(
        LogSource.Internals,
        'RECORDING',
        'Recording-bot: will end the meeting after 15 seconds if no one joins',
      );
      timer = setTimeout(() => {
        // Check again if still there are some users
        logger.log(
          LogSource.Internals,
          'RECORDING',
          'Recording-bot: trying to stop recording',
        );
        stopAPICalledByBotOnce.current = true;
        clearTimeout(timer);
        _stopRecording();
        // Run after 15 seconds
      }, 15000);
      log('Recording-bot: timer starts, timerId - ', timer);
    }
    return () => {
      log('Recording-bot: clear timer,  timerId - ', timer);
      clearTimeout(timer);
    };
  }, [
    isRecordingBot,
    isRecordingActive,
    hostUids,
    _stopRecording,
    setRecordingActive,
  ]);

  useEffect(() => {
    if (hasUserJoinedRTM && isRecordingBot) {
      log('Recording-bot: sending event that recording has started');
      logger.log(
        LogSource.Internals,
        'RECORDING',
        'Recording-bot: sending event recording-started event to users in the call',
      );
      events.send(
        EventNames.RECORDING_ATTRIBUTE,
        JSON.stringify({
          action: EventActions.RECORDING_STARTED,
          value: `${localUid}`,
        }),
        PersistanceLevel.Session,
      );
    }
  }, [isRecordingBot, hasUserJoinedRTM, localUid, setRecordingActive]);
  // ************ Recording Bot ends ************

  return (
    <RecordingContext.Provider
      value={{
        inProgress,
        startRecording,
        stopRecording,
        isRecordingActive,
        fetchRecordings,
      }}>
      {props.children}
    </RecordingContext.Provider>
  );
};
/**
 * The Recording app state governs the App Builder cloud recording functionality.
 */
const useRecording = createHook(RecordingContext);

export {RecordingProvider, useRecording};
