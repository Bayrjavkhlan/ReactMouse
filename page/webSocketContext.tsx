import React, { createContext, useContext, ReactNode, useEffect, useState, useRef } from "react";
import WebSocketManager from "./webSocketConnection";

interface WebSocketProviderProps {
  children: ReactNode;
  initialUrl: string;
  currentScreen: string;
}

const WebSocketContext = createContext<{manager: WebSocketManager, currentScreen: string}>({
  manager: new WebSocketManager(''),
  currentScreen: ''
});

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ initialUrl, children, currentScreen }) => {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null);

  useEffect(() => {
    if (!wsManagerRef.current && initialUrl && initialUrl !== 'ws://example.com') {
      console.log('Initializing WebSocket with URL:', initialUrl);
      const manager = new WebSocketManager(`ws://${initialUrl}:8080`);
      wsManagerRef.current = manager;
      setWsManager(manager);
      manager.connect();

      setInterval(() => {
        console.log('WebSocket connection status:', manager.isConnected);
      }, 3000);
    }
  }, [initialUrl]);

  const contextValue = {
    manager: wsManagerRef.current || new WebSocketManager(''),
    currentScreen
  };
  
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  // console.log('Using WebSocket in screen:', context.currentScreen);
  // console.log('WebSocket connected status:', context.manager.isConnected);
  return context;
};
