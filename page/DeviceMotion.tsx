import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";
import { useWebSocket } from "./webSocketContext";

type MotionData = {
  x: number;
  y: number;
  z: number;
};

export default function DeviceMotionScreen() {
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const [isMotionActive, setIsMotionActive] = useState(false);
  const { motionWs, currentScreen } = useWebSocket();

  useEffect(() => {
    let subscription: any;

    if (isMotionActive) {
      subscription = DeviceMotion.addListener((motion: DeviceMotionMeasurement) => {
        const acceleration = motion.accelerationIncludingGravity;

        if (acceleration) {
          const data: MotionData = {
            x: acceleration.x || 0,
            y: acceleration.y || 0,
            z: acceleration.z || 0,
          };

          setMotionData(data);

          sendMotionData(data);
        }
      });

      DeviceMotion.setUpdateInterval(100);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isMotionActive, motionWs, currentScreen]);

  const toggleMotion = () => {
    setIsMotionActive(!isMotionActive);
  };

  const sendMotionData = (motionData: any) => {
    if (motionWs?.isConnected && currentScreen === 'Motion') {
      try {
        console.log('Sending motion data:', motionData);
        motionWs.send(JSON.stringify(motionData));
      } catch (error) {
        console.error('Error sending motion data:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Phone Motion Data:</Text>
      <Text style={styles.data}>
        X: {motionData ? motionData.x.toFixed(2) : "0"}
      </Text>
      <Text style={styles.data}>
        Y: {motionData ? motionData.y.toFixed(2) : "0"}
      </Text>
      <Text style={styles.data}>
        Z: {motionData ? motionData.z.toFixed(2) : "0"}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={toggleMotion}
        >
          <Text style={styles.buttonText}>
            {isMotionActive ? "Stop Motion Mouse" : "Start Motion Mouse"}
          </Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 100,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
