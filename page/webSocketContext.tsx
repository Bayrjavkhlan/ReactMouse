import React, { createContext, useContext, useRef, useEffect } from 'react';
import WebSocketManager from './webSocketConnection';

interface WebSocketContextType {
  motionWs: WebSocketManager | null;
  touchWs: WebSocketManager | null;
  currentScreen: string;
}

const WebSocketContext = createContext<WebSocketContextType>({
  motionWs: null,
  touchWs: null,
  currentScreen: ''
});

interface WebSocketProviderProps {
  children: React.ReactNode;
  initialUrl: string | null;
  currentScreen: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  initialUrl,
  currentScreen
}) => {
  const motionWsRef = useRef<WebSocketManager | null>(null);
  const touchWsRef = useRef<WebSocketManager | null>(null);
  console.log('initialUrl;\t', initialUrl);
  console.log('currentScreen:\t', currentScreen);
  
  useEffect(() => {
    // Skip connection if URL is empty, default, or example.com
    if (initialUrl){
      // Parse the base URL to get host and port
      const basePort = 8080; // Default port for motion

      // Create URLs with different ports
      const motionUrl = `ws://${initialUrl}:${basePort}/motion`;
      const touchUrl = `ws://${initialUrl}:${basePort + 2}/touch`;  // Port 8082 for touch

      console.log('Initializing Motion WebSocket with URL:', motionUrl);
      const motionManager = new WebSocketManager(motionUrl);
      motionWsRef.current = motionManager;
      motionManager.connect();
      console.log('motionManager - WebSocket Status123:', motionManager?.getStatus());
      console.log('motionManager - Is Connected:', motionManager?.isConnected);

      console.log('Initializing Touch WebSocket with URL:', touchUrl);
      const touchManager = new WebSocketManager(touchUrl);
      touchWsRef.current = touchManager;
      touchManager.connect();
      console.log('touchManager - WebSocket Status123:', touchManager?.getStatus());
      console.log('touchManager - Is Connected:', touchManager?.isConnected);
      
      // Cleanup function
      return () => {
        console.log('Cleaning up WebSocket connections');
        motionWsRef.current?.close();
        touchWsRef.current?.close();
      };
    }
  }, [initialUrl]);

  return (
    <WebSocketContext.Provider 
      value={{ 
        motionWs: motionWsRef.current, 
        touchWs: touchWsRef.current, 
        currentScreen 
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
