import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DeviceMotion } from "expo-sensors";
import { WebSocket } from "react-native-websocket";

export default function App() {
  const [motionData, setMotionData] = useState(null);

  // Connect to the WebSocket server
  const ws = new WebSocket("ws://<laptop-ip>:8080");

  useEffect(() => {
    const subscription = DeviceMotion.addListener((motion) => {
      const acceleration = motion.accelerationIncludingGravity;
      setMotionData(acceleration);

      // Send motion data to the WebSocket server
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            x: acceleration.x,
            y: acceleration.y,
            z: acceleration.z,
          })
        );
      }
    });

    // Set update interval
    DeviceMotion.setUpdateInterval(100);

    // Cleanup
    return () => {
      subscription.remove();
      ws.close();
    };
  }, [ws]);

  const formatData = (data) => (data ? data.toFixed(2) * 1 : "0.00");

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phone Motion Data:</Text>
      <Text style={styles.data}>
        X: {motionData ? formatData(motionData.x) : "Loading..."} cm/s²
      </Text>
      <Text style={styles.data}>
        Y: {motionData ? formatData(motionData.y) : "Loading..."} cm/s²
      </Text>
      <Text style={styles.data}>
        Z: {motionData ? formatData(motionData.z) : "Loading..."} cm/s²
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
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  data: {
    fontSize: 16,
    color: "#333",
    marginVertical: 5,
  },
});
