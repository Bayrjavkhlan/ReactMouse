import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useWebSocket } from "./webSocketContext";

interface QRReaderScreenProps {
  onUrlDetected: (url: string) => void;
  navigation: any; // Adjust the type as per your navigation setup
}

const QRReaderScreen: React.FC<QRReaderScreenProps> = ({ onUrlDetected, navigation }) => {
  const ws = useWebSocket(); // Ensure WebSocket context is available
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      const isValid = isValidIpAddress(data);

      if (isValid) {
        Alert.alert("IP Address Detected",
        `Do you want to connect to ${data}?`, [
          {
            text: "Cancel",
            onPress: () => setScanned(false),
            style: "cancel"
          },
          { text: "Connect", onPress: () => (
            onUrlDetected(data),
            navigation.navigate('TouchPad')
          )}]);
      } else {
        Alert.alert("Invalid QR Code", "This QR code does not contain a valid IP address.", [
          { text: "OK", onPress: () => setScanned(false) },
        ]);
      }
    }
  };

  const isValidIpAddress = (data: string) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
    return ipRegex.test(data);
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} // Corrected prop name
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <Text style={styles.heading}>Scan an IP Address QR Code</Text>
        </View>
      </CameraView>
      {scanned && (
        <Text style={styles.rescanText} onPress={() => setScanned(false)}>
          Tap to scan again
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    fontSize: 18,
    color: "red",
  },
  rescanText: {
    position: "absolute",
    bottom: 20,
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 5,
  },
});

export default QRReaderScreen;
