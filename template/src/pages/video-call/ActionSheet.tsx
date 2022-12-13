import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
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
    root.style.setProperty('--handle-background', $config.SEMANTIC_NETRUAL);
  }, []);

  function onDismiss() {
    setIsOpen(false);
  }
  function onChatDismiss() {
    handleSheetChanges(0);
    setIsChatOpen(false);
  }
  function onParticipantsDismiss() {
    handleSheetChanges(0);
    setIsParticipantsOpen(false);
  }
  function onSettingsDismiss() {
    handleSheetChanges(0);
    setIsSettingsOpen(false);
  }

  const handleSpringStart = (event: SpringEvent) => {
    if (event.type == 'SNAP' && event.source == 'dragging') {
      setIsExpanded(!isExpanded);
    }
  };

  const updateActionSheet = (
    screenName: 'chat' | 'participants' | 'settings',
  ) => {
    switch (screenName) {
      case 'chat':
        setIsChatOpen(true);
        break;
      case 'participants':
        setIsParticipantsOpen(true);
        break;
      case 'settings':
        console.warn('settings selected');
        setIsSettingsOpen(true);
        break;
      default:
    }
  };
  return (
    <>
      {isExpanded && (
        <TouchableWithoutFeedback onPress={() => handleSheetChanges(0)}>
          <View style={[styles.backDrop]} />
        </TouchableWithoutFeedback>
      )}
      <View>
        {/* Controls Action Sheet */}

        <BottomSheet
          ref={bottomSheetRef}
          open={true}
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
          blocking={true}
          expandOnContentDrag={true}
          snapPoints={({maxHeight}) => [1 * maxHeight]}
          defaultSnap={({lastSnap, snapPoints}) => snapPoints[0]}>
          <Chat handleClose={onChatDismiss} />
        </BottomSheet>
        {/* Participants Action Sheet */}
        <BottomSheet
          ref={participantsSheetRef}
          open={isParticipantsOpen}
          onDismiss={onParticipantsDismiss}
          //onSpringStart={handleSpringStart}
          expandOnContentDrag={true}
          snapPoints={({maxHeight}) => [1 * maxHeight]}
          defaultSnap={({lastSnap, snapPoints}) => snapPoints[0]}
          blocking={false}>
          <ParticipantView
            handleClose={onParticipantsDismiss}
            updateActionSheet={updateActionSheet}
          />
        </BottomSheet>
        {/* Settings Screen */}

        <BottomSheet
          ref={settingsSheetRef}
          open={isSettingsOpen}
          onDismiss={onSettingsDismiss}
          //onSpringStart={handleSpringStart}
          expandOnContentDrag={true}
          // snapPoints={({maxHeight}) => [0.5 * maxHeight, 1 * maxHeight]}
          snapPoints={({maxHeight}) => [1 * maxHeight]}
          defaultSnap={({lastSnap, snapPoints}) => snapPoints[0]}
          blocking={false}>
          <SettingsView handleClose={onSettingsDismiss} />
        </BottomSheet>
      </View>
    </>
  );
};

export default ActionSheet;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'red',
  },
  content: {
    borderWidth: 1,
    borderColor: 'yellow',
    flex: 1,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    opacity: 0.2,
  },
});
