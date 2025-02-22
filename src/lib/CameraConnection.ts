import { io, Socket } from 'socket.io-client';

export interface CameraStatus {
    camera_id: string;
    status: 'connected' | 'disconnected';
    timestamp: string;
}

export interface CommandResponse {
    camera_id: string;
    command: string;
    status: 'executed' | 'failed';
    reason?: string;
    timestamp: string;
}

export type CameraCommand = 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out';

export interface CameraRegistration {
    camera_id: string;
    ip_address: string;
}

export class CameraConnection {
    private socket: Socket;
    private heartbeatInterval: NodeJS.Timeout | null;
    private reconnectTimeout: NodeJS.Timeout | null;

    constructor(serverUrl: string) {
        this.socket = io(serverUrl);
        this.heartbeatInterval = null;
        this.reconnectTimeout = null;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.startReconnectTimer();
        });

        this.socket.on('heartbeat_response', (data: { status: string; camera_id: string }) => {
            console.log('Heartbeat acknowledged:', data);
        });

        this.socket.on('camera_status', (data: CameraStatus) => {
            window.dispatchEvent(new CustomEvent<CameraStatus>('cameraStatusUpdate', { detail: data }));
        });

        this.socket.on('command_status', (data: CommandResponse) => {
            window.dispatchEvent(new CustomEvent<CommandResponse>('commandResponse', { detail: data }));
        });
    }

    public startHeartbeat(cameraId: string): void {
        this.heartbeatInterval = setInterval(() => {
            this.socket.emit('heartbeat', { camera_id: cameraId });
        }, 5000);
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

    public sendCommand(cameraId: string, command: CameraCommand): void {
        this.socket.emit('camera_command', {
            camera_id: cameraId,
            command: command
        });
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