import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import DeviceMotionScreen from "./page/DeviceMotion";
import TouchPadScreen from "./page/TouchPad";
import QRReaderScreen from "./page/QrReader";
import { WebSocketProvider } from "./page/webSocketContext";

const Tab = createBottomTabNavigator();

export default function App() {
  const [url, setUrl] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("Camera");
  
  const CameraScreen = ({ navigation }) => (
    <QRReaderScreen
      navigation={navigation}
      onUrlDetected={(newUrl) => {
        setUrl(newUrl);
        setCurrentScreen("TouchPad");
      }}
    />
  );

  return (
    <WebSocketProvider initialUrl={url} currentScreen={currentScreen}>
      <NavigationContainer>
        <Tab.Navigator
        initialRouteName="Camera"
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
          }}
          screenListeners={{
            state: (e) => {
              const currentRouteName = e.data.state.routes[e.data.state.index].name;
              setCurrentScreen(currentRouteName);
            },
          }}
        >
          <Tab.Screen
            name="Motion"
            component={DeviceMotionScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <FontAwesome name="mobile-phone" size={24} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              tabBarIcon: () => (
                <View style={styles.middleButton}>
                  <FontAwesome name="camera" size={28} color="#fff" />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="TouchPad"
            component={TouchPadScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <FontAwesome name="hand-paper-o" size={24} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </WebSocketProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    elevation: 10, 
  },
  middleButton: {
    position: "absolute",
    bottom: 0,
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 10,
    borderColor: "#fff",
  },
});
