import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { useWebSocket } from './webSocketContext';

export default function TouchPadScreen() {
  const { manager: ws, currentScreen } = useWebSocket();
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });
  const isTracking = useRef(false);
  const touchCount = useRef(0);
  const initialTouchDistance = useRef(0);
  const lastSentTime = useRef(0);
  const SEND_INTERVAL = 16; // ~60fps
  
  const calculateTouchDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[1].pageX - touches[0].pageX;
    const dy = touches[1].pageY - touches[0].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const sendTouchData = (data: any) => {
    const now = Date.now();
    if (now - lastSentTime.current >= SEND_INTERVAL) {
      if (ws?.isConnected && currentScreen === 'TouchPad') {
        const sendData = {
          type: "touch",
          data: data
        };
        ws.send(JSON.stringify(sendData));
        console.log('Sending from TouchPad Screen:', sendData);
        lastSentTime.current = now;
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        touchCount.current = touches.length;
        isTracking.current = true;

        if (touches.length >= 2) {
          initialTouchDistance.current = calculateTouchDistance(touches);
        }

        const touch = evt.nativeEvent;
        lastPosition.current = {
          x: touch.pageX,
          y: touch.pageY
        };
        
        sendTouchData({
          action: 'start',
          touchCount: touchCount.current,
          x: touch.pageX,
          y: touch.pageY,
          timestamp: Date.now()
        });
      },

      onPanResponderMove: (evt, gestureState) => {
        if (isTracking.current) {
          const touches = evt.nativeEvent.touches;
          const currentX = gestureState.moveX;
          const currentY = gestureState.moveY;
          
          const deltaX = currentX - lastPosition.current.x;
          const deltaY = currentY - lastPosition.current.y;
          
          lastPosition.current = { x: currentX, y: currentY };

          const velocity = Math.sqrt(
            gestureState.vx * gestureState.vx + 
            gestureState.vy * gestureState.vy
          );

          let gestureType = 'move';
          let scale = 1;

          if (touches.length >= 2) {
            const currentDistance = calculateTouchDistance(touches);
            scale = currentDistance / initialTouchDistance.current;
            
            if (touches.length === 2) {
              gestureType = 'scroll';
            } else if (touches.length === 3) {
              gestureType = 'gesture';
            }
          }

          const touchData = {
            action: gestureType,
            touchCount: touches.length,
            deltaX,
            deltaY,
            velocity,
            scale,
            absoluteX: currentX,
            absoluteY: currentY,
            timestamp: Date.now()
          };

          setTouchPosition({ x: currentX, y: currentY });
          sendTouchData(touchData);
        }
      },

      onPanResponderRelease: (evt) => {
        isTracking.current = false;
        touchCount.current = 0;
        initialTouchDistance.current = 0;

        sendTouchData({
          action: 'end',
          touchCount: 0,
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          timestamp: Date.now()
        });
      }
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Touchpad</Text>
      <View 
        style={styles.touchArea} 
        {...panResponder.panHandlers}
      >
        <Text style={styles.instructions}>
          Use this area as a touchpad{'\n'}
          • One finger: Move cursor{'\n'}
          • Two fingers: Scroll{'\n'}
          • Three fingers: Gestures
        </Text>
        <Text style={styles.debugText}>
          Position: {'\n'}
          X: {touchPosition.x.toFixed(0)} {'\n'}
          Y: {touchPosition.y.toFixed(0)} {'\n'}
          Fingers: {touchCount.current} {'\n'}
          Connected: {ws?.isConnected ? 'Yes' : 'No'}
        </Text>
      </View>
    </View>
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
    margin: 20,
  },
  touchArea: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    margin: 20,
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
  debugText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    position: 'absolute',
    bottom: 100,
  }
});

