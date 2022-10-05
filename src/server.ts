"use strict";
import { WebsocketProvider } from "./providers/WebsocketProvider";

const server = async (): Promise<WebsocketProvider | null> => {
    try {
        const socket = new WebsocketProvider(8080,"test-websocket");
    
        socket.on("message",(message: string) => {
            console.log(message);
        });
        
        socket.on("close",() => {
            console.log("A connection has closed.");
        });
        
        socket.on("connect",() => {
            console.log("A connection has been made.");
        });
    
        await socket.connect();

        return socket;
    } catch(error) {
        console.error(error);
    }

    return null;
}

server();