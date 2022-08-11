import { ErrorEvent, WebSocket } from 'ws';
import { Heart } from './Heart';

type onConnectCallback = (connection: WebSocket) => void;
type onMessageCallback = (message: string) => void;
type onCloseCallback = () => void;
type onErrorCallback = (event: ErrorEvent) => void;

export class WebsocketProvider {
    #_reconnect: boolean = false;
    #_heart: Heart;
    #_socket;
    #_port: number = 8080;
    #_connection: any = null;
    #_onConnectCallback: onConnectCallback = () => {};
    #_onMessageCallback: onMessageCallback = () => {};
    #_onCloseCallback:   onCloseCallback   = () => {};
    #_onErrorCallback:   onErrorCallback   = () => {};

    constructor(port: number, timeout?: number, reconnect?: boolean) {
        this.#_port = port;
        this.#_socket = new WebSocket.Server({ port });

        this.#_heart = new Heart(timeout ?? 30);

        this.#_reconnect = reconnect ?? false;

        console.log(`Defining a new websocket on port ${this.#_port}`);
    }

    /**
     * Listen for an event.
     * @param eventName The name of the event to listen for.
     * @param callback The callback to fire once an event is thrown.
     * @throws An error if you attempt to assign a new event listener while the websocket is connected.
     */
    on = (eventName: string, callback: Function): void => {
        if(!this.#_connection) throw new Error("Tried to assign a new event listener while the connection is active!");

        if(eventName == "connect") this.#_onConnect(callback as onConnectCallback);
        if(eventName == "message") this.#_onMessage(callback as onMessageCallback);
        if(eventName == "close")     this.#_onClose(callback as onCloseCallback);
        if(eventName == "error")     this.#_onError(callback as onErrorCallback);

        console.warn(`WebsocketProvider was asked to listen for event: ${eventName}. But no such event exists!`);
    }

    /**
     * Set the callback to fire when the WebSocket first connects.
     * @param callback The callback to fire when the WebSocket connection opens.
     */
    #_onConnect = (callback: onConnectCallback): void => { this.#_onConnectCallback = callback };

    /**
     * Set the callback to fire when the WebSocket receives a message.
     * @param callback The callback to fire when the WebSocket receives a message.
     */
    #_onMessage = (callback: onMessageCallback): void => {this.#_onMessageCallback = callback};

    /**
     * Set the callback to fire when the WebSocket connection closes.
     * @param callback The callback to fire when the WebSocket connection closes.
     */
    #_onClose = (callback: onCloseCallback): void => { this.#_onCloseCallback = callback; };

    /**
     * Set the callback to fire when the WebSocket connection encounters an error.
     * @param callback The callback to fire when the WebSocket encounters an error.
     */
    #_onError = (callback: onErrorCallback): void => {this.#_onErrorCallback = callback};

    /**
     * Open the WebSocket connection.
     */
    connect = (): Promise<boolean> => new Promise((success, failure) => {
            const connectionHandler = (connection: WebSocket) => {
                console.log(`Starting websocket server on port ${this.#_port}`);

                this.#_connection = connection;
                this.#_onConnectCallback(connection);

                /**
                 * If the heart dies, terminate the connection.
                 */
                this.#_heart.on("death",() => {
                    this.#_socket.close();
                });
                /**
                 * Start the heart.
                 */
                this.#_heart.start(() => {
                    this.#_heart.killLater();
                    this.#_connection.ping();
                });

                /**
                 * When the connection is pinged, re-confirm the heartbeat.
                 */
                this.#_connection.on('pong', this.#_heart.keepBeating());

                /**
                 * When message is received call the specified callback.
                 */
                 this.#_connection.on("message", (message: string) => this.#_onMessageCallback(message));

                /**
                 * When connection dies, kill the heart and call the specified callback.
                 */
                 this.#_connection.on("close", () => {
                    this.#_heart.kill();
                    this.#_onCloseCallback;

                    // TODO: Attempt to reconnect (might cause issues, needs to be tested)
                    if(this.#_reconnect) this.connect();
                });

                /**
                 * When there's an error on the connection, call the specified callback.
                 */
                this.#_connection.on("error", this.#_onErrorCallback);

                console.log(`Started websocket server on port ${this.#_port}`);
                return success(true);
            }

            try {
            this.#_socket.on("connection", (connection: WebSocket) => connectionHandler(connection));
            } catch(error) {
                return failure(false);
            }
        }
    );

    /**
     * Sets whether or not the WebSocket should attempt to reconnect if it get's disconnected.
     * @param shouldReconnect Should the WebSocket attempt to reconnect if it disconnects.
     * @throws An error if you try to set this while the WebSocket is already connected.
     */
    shouldReconnect = (shouldReconnect: boolean): void => {
        if(this.#_connection) throw new Error("You must set a WebSocket's reconnection status before connecting it!");

        this.#_reconnect = shouldReconnect;
    }

    /**
     * Send a message over the connection.
     * @param message The message to be sent.
     * @throws An error if you try to send a message when the connection is closed.
     */
    send = (message: string): void => {
        if(!this.#_connection) throw new Error("Tried to send a message over a WebSocket connection that wasn't open!");

        this.#_connection.send(message);
    }

    /**
     * Ping the connection.
     * @throws An error if you try to ping the connection while it's closed.
     */
    ping = (): void => {
        if(!this.#_connection) throw new Error("Tried to send a message over a WebSocket connection that wasn't open!");

        this.#_connection.ping();
    }

    /**
     * Close the connection.
     * If you have `.shouldReconnect()` set to `true` this connection will reopen immediately after closing. If you want to permanently close the connection, use `.kill()` instead.
     */
    close = (): void => {
        if(!this.#_connection) return;

        this.#_connection.close();
    }

    /**
     * Kill the connection.
     * The only difference between this and `.close()` is that if `.shouldReconnect()` is set to `true` this will force it to close until it is reopened with `.connect()`.
     */
    kill = (): void => {
        if(!this.#_connection) return;

        this.#_reconnect = false;
        this.#_connection.close();
    }
}