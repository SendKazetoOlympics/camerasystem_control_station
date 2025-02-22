import { io, Socket } from 'socket.io-client';

interface CameraStatus {
    status: 'idle' | 'recording' | 'paused' | 'disconnected';
    timestamp: number;
}


export class CameraConnection {
    ip_address: string;
    private socket: Socket;
    status: CameraStatus = $state(
        {
            status: 'idle',
            timestamp: Date.now(),
        },
    );
    private heartbeatInterval: NodeJS.Timeout | null;
    private reconnectTimeout: NodeJS.Timeout | null;

    constructor(serverUrl: string) {
        this.ip_address = serverUrl;
        this.socket = io(serverUrl);
        this.status = {
            status: 'idle',
            timestamp: Date.now(),
        };
        this.heartbeatInterval = null;
        this.reconnectTimeout = null;
    }

    public startHeartbeat(): void {
        console.log('Starting heartbeat');
        this.heartbeatInterval = setInterval(() => {
            this.socket.emit('ping', (callback: number) => {
                console.log(callback);
                this.status.timestamp = callback;
            });
        }, 1000);
    }

    public stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private startReconnectTimer(): void {
        this.reconnectTimeout = setTimeout(() => {
            this.socket.connect();
        }, 5000);
    }

    public disconnect(): void {
        this.stopHeartbeat();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.socket.disconnect();
    }
}
