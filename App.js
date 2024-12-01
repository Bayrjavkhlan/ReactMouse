import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DeviceMotion } from "expo-sensors";

export default function App() {
  const [motionData, setMotionData] = useState(null);

  useEffect(() => {
    const subscription = DeviceMotion.addListener((motion) => {
      setMotionData(motion.accelerationIncludingGravity); // or use motion.acceleration for linear acceleration
    });

    // Clean up the subscription on unmount
    return () => subscription.remove();
  }, []);

  const formatData = (data) => {
    return data ? data.toFixed(2) * 1 : "0.00";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phone Acceleration (cm/s²):</Text>
      <Text style={styles.data}>
        X-axis: {motionData ? formatData(motionData.x) : "Loading..."} cm/s²
      </Text>
      <Text style={styles.data}>
        Y-axis: {motionData ? formatData(motionData.y) : "Loading..."} cm/s²
      </Text>
      <Text style={styles.data}>
        Z-axis: {motionData ? formatData(motionData.z) : "Loading..."} cm/s²
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
