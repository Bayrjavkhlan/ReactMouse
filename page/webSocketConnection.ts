// WebSocketManager.ts
export default class WebSocketManager {
    public url: string;
    private ws: WebSocket | null = null;
    public isConnected: boolean = false;

    constructor(url: string) {
        this.url = url.startsWith('ws://') || url.startsWith('wss://') 
            ? url 
            : `ws://${url}`;
        console.log('WebSocketManager created with URL:', this.url);
    }

    connect(): void {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            console.log('Attempting to connect to:', this.url);
            try {
                console.log('this.url', this.url);
                
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    this.isConnected = true;
                    console.log("WebSocket connected successfully to:", this.url);
                };

                this.ws.onclose = (event) => {
                    this.isConnected = false;
                    console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
                    if (event.code !== 1000) {
                        console.log("Attempting to reconnect...");
                        setTimeout(() => this.connect(), 3000);
                    }
                };

                this.ws.onerror = (error: Event) => {
                    console.error("WebSocket connection error:", error);
                    this.isConnected = false;
                };

                this.ws.onmessage = (event) => {
                    console.log("WebSocket received message:", event.data);
                };

            } catch (error) {
                console.error("Error creating WebSocket connection:", error);
                this.isConnected = false;
            }
        }
    }

    send(data: unknown): void {
        if (!this.ws) {
            console.log("No WebSocket instance - attempting to connect");
            this.connect();
            return;
        }

        if (this.ws.readyState !== WebSocket.OPEN) {
            console.log("WebSocket not open - current state:", this.ws.readyState);
            return;
        }

        try {
            const message = {
                mouseData: data
            };
            console.log('WebSocket sending:', message);
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error("Failed to send data over WebSocket:", error);
            this.isConnected = false;
            this.connect();
        }
    }

    close(): void {
        if (this.ws) {
            this.ws.close(1000, "Closing connection normally");
            this.isConnected = false;
        }
    }

    getStatus(): string {
        if (!this.ws) return 'No WebSocket instance';
        return `WebSocket ${this.ws.readyState}: ${
            this.ws.readyState === WebSocket.CONNECTING ? 'CONNECTING' :
            this.ws.readyState === WebSocket.OPEN ? 'OPEN' :
            this.ws.readyState === WebSocket.CLOSING ? 'CLOSING' :
            'CLOSED'
        }`;
    }
}
