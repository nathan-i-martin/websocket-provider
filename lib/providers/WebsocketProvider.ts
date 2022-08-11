import { WebSocket } from 'ws';

export class WebsocketProvider {
    #_socket;
    #_port: number = 8080;
    #_connection: any = null;
    #_onConnectCallback:  Function        = () => {};
    #_onMessageCallback:  Function        = () => {};
    #_onCloseCallback:    Function        = () => {};
    #_onErrorCallback:    Function        = () => {};


    constructor(port: number) {
        this.#_port = port;
        this.#_socket = new WebSocket.Server({ port });
        console.log(`Defining a new websocket on port ${this.#_port}`);
    }
    
    onConnect = (callback: Function) => this.#_onConnectCallback = callback;
    onMessage = (callback: Function) => this.#_onMessageCallback = callback;
    onClose   = (callback: Function) => this.#_onCloseCallback   = callback;
    onError   = (callback: Function) => this.#_onErrorCallback   = callback;

    connect = () => {
        const handler = (connection: any) => {
            console.log(`Starting websocket server on port ${this.#_port}`);

            this.#_connection = connection;
            this.#_onConnectCallback();
            
            connection.on("message", (message: string) => this.#_onMessageCallback(message));
            
            connection.on("close", this.#_onCloseCallback);
            
            connection.onerror = this.#_onErrorCallback();
        }

        this.#_socket.on("connection", (connection: any) => handler(connection));
    }

    send = (message: string) => {
        if(!this.#_connection) return;

        this.#_connection.send(message);
    }

}