import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useRef, useCallback, useLayoutEffect, useEffect} from 'react';
import {BottomSheet, BottomSheetRef} from 'react-spring-bottom-sheet';
import './ActionSheetStyles.css';
import ActionSheetContent from './ActionSheetContent';
import {SpringEvent} from 'react-spring-bottom-sheet/dist/types';
import Chat from '../../components/Chat';
import ParticipantView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';

const ActionSheet = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const chatSheetRef = useRef<BottomSheetRef>(null);
  const participantsSheetRef = useRef<BottomSheetRef>(null);
  const settingsSheetRef = useRef<BottomSheetRef>(null);

  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef.current?.snapTo(({snapPoints}) => snapPoints[index]);
    index === 0 ? setIsExpanded(false) : setIsExpanded(true);
  }, []);

  const root = document.documentElement;

  useEffect(() => {
    root.style.setProperty('--sheet-background', $config.CARD_LAYER_1_COLOR);
    root.style.setProperty(
      '--handle-background',
      $config.PRIMARY_ACTION_BRAND_COLOR,
    );
  }, []);

  function onDismiss() {
    setIsOpen(false);
  }
  function onChatDismiss() {
    setIsChatOpen(false);
  }
  function onParticipantsDismiss() {
    setIsParticipantsOpen(false);
  }
  function onSettingsDismiss() {
    setIsSettingsOpen(false);
  }

  const handleSpringStart = (event: SpringEvent) => {
    if (event.type == 'SNAP' && event.source == 'dragging') {
      console.warn('up');
      console.log(event);
      setIsExpanded(!isExpanded);
    }
  };

  const updateActionSheet = (
    screenName: 'chat' | 'participants' | 'settings',
  ) => {
    switch (screenName) {
      case 'chat':
        console.warn('chat selected');
        // setIsOpen(false);
        setIsChatOpen(true);
        //chatSheetRef?.current?.snapTo(({snapPoints}) => snapPoints[0]);
        break;
      case 'participants':
        setIsParticipantsOpen(true);
        //  participantsSheetRef?.current.present();
        break;
      case 'settings':
        console.warn('settings selected');
        setIsSettingsOpen(true);
        // settingsSheetRef?.current.present();
        break;
      default:
      //bottomSheetRef?.current.present();
    }
  };
  return (
    <View>
      {/* Controls Action Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        open={isOpen}
        //  onDismiss={onDismiss}
        onSpringStart={handleSpringStart}
        expandOnContentDrag={true}
        snapPoints={({maxHeight}) => [0.15 * maxHeight, 0.5 * maxHeight]}
        defaultSnap={({lastSnap, snapPoints}) =>
          lastSnap ?? Math.min(...snapPoints)
        }
        blocking={false}>
        <ActionSheetContent
          updateActionSheet={updateActionSheet}
          handleSheetChanges={handleSheetChanges}
          isExpanded={isExpanded}
        />
      </BottomSheet>
      {/* Chat  Action Sheet */}
      <BottomSheet
        ref={chatSheetRef}
        open={isChatOpen}
        onDismiss={onChatDismiss}
        //onSpringStart={handleSpringStart}
        expandOnContentDrag={true}
        snapPoints={({maxHeight}) => [1 * maxHeight]}
        defaultSnap={({lastSnap, snapPoints}) =>
          lastSnap ?? Math.max(...snapPoints)
        }
        blocking={false}>
        <ScrollView style={styles.content}>
          <Text>Chat</Text>
          {/* <Chat handleClose={onChatDismiss} /> */}
        </ScrollView>
      </BottomSheet>
      {/* Participants Action Sheet */}
      <BottomSheet
        ref={participantsSheetRef}
        open={isParticipantsOpen}
        onDismiss={onParticipantsDismiss}
        //onSpringStart={handleSpringStart}
        expandOnContentDrag={true}
        snapPoints={({maxHeight}) => [1 * maxHeight]}
        defaultSnap={({lastSnap, snapPoints}) =>
          lastSnap ?? Math.max(...snapPoints)
        }
        blocking={false}>
        <ScrollView style={styles.content}>
          <Text>Participants</Text>
          {/* <ParticipantView handleClose={onParticipantsDismiss} /> */}
        </ScrollView>
      </BottomSheet>
      {/* Settings Screen */}

      <BottomSheet
        ref={settingsSheetRef}
        open={isSettingsOpen}
        onDismiss={onSettingsDismiss}
        //onSpringStart={handleSpringStart}
        expandOnContentDrag={true}
        snapPoints={({maxHeight}) => [1 * maxHeight]}
        defaultSnap={({lastSnap, snapPoints}) =>
          lastSnap ?? Math.max(...snapPoints)
        }
        blocking={false}>
        <ScrollView style={styles.content}>
          <SettingsView handleClose={onSettingsDismiss} />
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

export default ActionSheet;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'red',
  },
  content: {
    paddingHorizontal: 16,
  },
});
