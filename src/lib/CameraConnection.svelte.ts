import { io, Socket } from 'socket.io-client';

interface CameraStatus {
    status: 'idle' | 'recording' | 'paused' | 'disconnected';
    timestamp: number;
}


export class CameraConnection {
    ip_address: string;
    port: number
    private socket: Socket;
    status: CameraStatus = $state(
        {
            status: 'idle',
            timestamp: Date.now(),
        },
    );
    private heartbeatInterval: NodeJS.Timeout | null;
    private reconnectTimeout: NodeJS.Timeout | null;

    constructor(serverUrl: string, port: number) {
        this.ip_address = serverUrl;
        this.port = port;
        this.socket = io(serverUrl + ':' + port);
        this.status = {
            status: 'idle',
            timestamp: Date.now(),
        };
        this.heartbeatInterval = null;
        this.reconnectTimeout = null;
    }

    public startHeartbeat(): void {
        console.log('Starting heartbeat at' + this.ip_address);
        this.heartbeatInterval = setInterval(() => {
            this.socket.emit('ping', (callback: number) => {
                console.log(callback);
                this.status.timestamp = callback;
            });
        }, 1000);
    }

    public stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            console.log('Stopping heartbeat at' + this.ip_address);
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    public startRecording(): void {
        console.log('Starting recording on camera ' + this.ip_address);
        this.socket.emit('start_recording');
    }

    public stopRecording(): void {
        console.log('Stopping recording on camera ' + this.ip_address);
        this.socket.emit('stop_recording');
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
