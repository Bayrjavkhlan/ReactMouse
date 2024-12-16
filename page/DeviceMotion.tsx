import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";
import { useWebSocket } from "./webSocketContext";

type MotionData = {
  x: number;
  y: number;
  z: number;
};

export default function DeviceMotionScreen() {
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const { manager: ws, currentScreen } = useWebSocket();
  
  useEffect(() => {
    const subscription = DeviceMotion.addListener((motion: DeviceMotionMeasurement) => {
      const acceleration = motion.accelerationIncludingGravity;

      if (acceleration) {
        const data: MotionData = {
          x: acceleration.x || 0,
          y: acceleration.y || 0,
          z: acceleration.z || 0,
        };

        setMotionData(data);

        if (ws?.isConnected && currentScreen === 'Motion') {
          const sendData = {
            type: "motion",
            data: data
          };
          console.log('Sending from Motion Screen:', sendData);
          ws.send(JSON.stringify(sendData));
        }
      }
    });

    DeviceMotion.setUpdateInterval(100);

    return () => subscription.remove();
  }, [ws, currentScreen]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phone Motion Data:</Text>
      <Text style={styles.data}>
        X: {motionData ? motionData.x.toFixed(2) : "Loading..."}
      </Text>
      <Text style={styles.data}>
        Y: {motionData ? motionData.y.toFixed(2) : "Loading..."}
      </Text>
      <Text style={styles.data}>
        Z: {motionData ? motionData.z.toFixed(2) : "Loading..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  data: {
    fontSize: 16,
    marginVertical: 5,
  },
});
