import { ErrorEvent, WebSocket } from 'ws';
import { Heart } from './Heart';

type onConnectCallback = (connection: WebSocket) => void;
type onMessageCallback = (message: string) => void;
type onCloseCallback = () => void;
type onErrorCallback = (event: ErrorEvent) => void;

export class WebsocketProvider {
    #_heart: Heart;
    #_socket;
    #_port: number = 8080;
    #_connection: any = null;
    #_onConnectCallback:  onConnectCallback = () => {};
    #_onMessageCallback:  onMessageCallback = () => {};
    #_onCloseCallback:    onCloseCallback   = () => {};
    #_onErrorCallback:    onErrorCallback   = () => {};

    constructor(port: number, timeout?: number) {
        this.#_port = port;
        this.#_socket = new WebSocket.Server({ port });

        this.#_heart = new Heart(timeout ?? 30);

        console.log(`Defining a new websocket on port ${this.#_port}`);
    }

    /**
     * Set the callback to fire when the WebSocket first connects
     * @param callback The callback to fire when the WebSocket connection opens
     */
    onConnect = (callback: onConnectCallback): void => { this.#_onConnectCallback = callback };

    /**
     * Set the callback to fire when the WebSocket receives a message
     * @param callback The callback to fire when the WebSocket receives a message
     */
    onMessage = (callback: onMessageCallback): void => {this.#_onMessageCallback = callback};

    /**
     * Set the callback to fire when the WebSocket connection closes
     * @param callback The callback to fire when the WebSocket connection closes
     */
    onClose = (callback: onCloseCallback): void => {
        this.#_heart.kill();
        this.#_onCloseCallback = callback
    };

    /**
     * Set the callback to fire when the WebSocket connection encounters an error
     * @param callback The callback to fire when the WebSocket encounters an error
     */
    onError = (callback: onErrorCallback): void => {this.#_onErrorCallback = callback};

    /**
     * Open the WebSocket connection
     */
    connect = (): void => {
        const connectionHandler = (connection: WebSocket) => {
            console.log(`Starting websocket server on port ${this.#_port}`);

            this.#_connection = connection;
            this.#_onConnectCallback(connection);

            this.#_heart.start(() => {
                this.#_heart.killLater();
                this.#_connection.ping();
            });

            /**
             * When the connection is pinged, re-confirm the heartbeat
             */
            this.#_connection.on('pong', this.#_heart.keepBeating());
            
            connection.on("message", (message: string) => this.#_onMessageCallback(message));
            
            connection.on("close", this.#_onCloseCallback);
            
            connection.on("error", this.#_onErrorCallback);
        }

        this.#_socket.on("connection", (connection: WebSocket) => connectionHandler(connection));
    }

    /**
     * Send a message over the connection
     * @param message The message to be sent
     * @throws An error if you try to send a message when the connection is closed
     */
    send = (message: string): void => {
        if(!this.#_connection) throw new Error("Tried to send a message over a WebSocket connection that wasn't open!");

        this.#_connection.send(message);
    }

    /**
     * Ping the connection
     * @returns `true` if the connection is open. `false` if the connection is closed
     * @throws An error if you try to ping the connection while it's closed
     */
    ping = (): void => {
        if(!this.#_connection) throw new Error("Tried to send a message over a WebSocket connection that wasn't open!");

        this.#_connection.ping();
    }
}