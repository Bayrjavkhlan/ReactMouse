import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, SafeAreaView } from 'react-native';
import { useWebSocket } from './webSocketContext';

export default function TouchPadScreen() {
  const { touchWs, currentScreen } = useWebSocket();
  const lastSentTime = useRef(0);
  const SEND_INTERVAL = 16; // ~60fps

  useEffect(() => {
    console.log('TouchPad Screen - WebSocket Status123:', touchWs?.getStatus());
    console.log('TouchPad Screenr - Is Connected:', touchWs?.isConnected);
    console.log('TouchPad Screen - Current Screen:', currentScreen);
  }, [touchWs?.isConnected, currentScreen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt, gestureState) => {
        console.log('Touch started');
        sendTouchData(gestureState);
      },

      onPanResponderMove: (evt, gestureState) => {
        sendTouchData(gestureState);
      },

      onPanResponderRelease: (evt, gestureState) => {
        console.log('Touch ended');
        sendTouchData(gestureState);
      }
    })
  ).current;

  const sendTouchData = (gestureState: any) => {
    const now = Date.now();
    if (now - lastSentTime.current >= SEND_INTERVAL) {
      if (touchWs?.isConnected && currentScreen === 'TouchPad') {
        try {
          const touchData = {
              stateID: gestureState.stateID,
              moveX: gestureState.moveX,
              moveY: gestureState.moveY,
              x0: gestureState.x0,
              y0: gestureState.y0,
              dx: gestureState.dx,
              dy: gestureState.dy,
              vx: gestureState.vx,
              vy: gestureState.vy,
              numberActiveTouches: gestureState.numberActiveTouches,
          };
          console.log('Attempting to send touch data:', touchData);
          touchWs.send(JSON.stringify(touchData));
          lastSentTime.current = now;
        } catch (error) {
          console.error('Error sending touch data:', error);
          
        }
      } else {
        console.log('Cannot send data123:', {
          isConnected: touchWs?.isConnected,
          currentScreen,
          wsStatus: touchWs?.getStatus()
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Touchpad</Text>
      <View 
        style={styles.touchArea} 
        {...panResponder.panHandlers}
      >
        <Text style={styles.instructions}>
          Use this area as a touchpad{'\n'}
          Connection Status: {touchWs?.isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    margin: 10,
  },
  touchArea: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    margin: 20,
    marginTop: 0,
    marginBottom: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
});

