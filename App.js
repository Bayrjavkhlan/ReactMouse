import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Accelerometer } from "expo-sensors";

export default function App() {
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [gravity, setGravity] = useState({ x: 0, y: 0, z: 0 });
  const [linearAcceleration, setLinearAcceleration] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    let subscription = null;

    const startAccelerometer = () => {
      subscription = Accelerometer.addListener((data) => {
        setAccelerometerData(data);
      });
      Accelerometer.setUpdateInterval(100); // Update every 100ms
    };

    startAccelerometer();

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    const alpha = 0.5; // Smoothing factor for gravity
    const newGravity = {
      x: alpha * gravity.x + (1 - alpha) * accelerometerData.x,
      y: alpha * gravity.y + (1 - alpha) * accelerometerData.y,
      z: alpha * gravity.z + (1 - alpha) * accelerometerData.z,
    };
    setGravity(newGravity);

    // Calculate linear acceleration (raw data - gravity)
    const linearAccel = {
      x: (accelerometerData.x - newGravity.x) * 100, // Convert to cm/s²
      y: (accelerometerData.y - newGravity.y) * 100, // Convert to cm/s²
      z: (accelerometerData.z - newGravity.z) * 100, // Convert to cm/s²
    };
    setLinearAcceleration(linearAccel);
  }, [accelerometerData]);

  const formatData = (num) => num.toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phone Acceleration (cm/s²):</Text>
      <Text style={styles.data}>
        X-axis: {formatData(linearAcceleration.x)} cm/s²
      </Text>
      <Text style={styles.data}>
        Y-axis: {formatData(linearAcceleration.y)} cm/s²
      </Text>
      <Text style={styles.data}>
        Z-axis: {formatData(linearAcceleration.z)} cm/s²
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
