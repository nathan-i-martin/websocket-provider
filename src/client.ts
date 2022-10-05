"use strict";
import prompt = require("prompt");
import { StandardProtocol } from "./interfaces/StandardProtocol";
import { URIBuilder } from "./providers/URIBuilder";
import { WebsocketSubscriber } from "./providers/WebsocketSubscriber";

prompt.start();
const recursive = (socket: WebsocketSubscriber) => {
    console.log('----------------------');
    prompt.get(['message'], (error: Error | null, result: any) => {
        if (error) {
            return console.log(error);
        }
        console.log('----------------------');
        socket.send(result.message);
        console.log('----------------------');
        recursive(socket);
    });
}

const subscriber = async (): Promise<WebsocketSubscriber | null> => {
    try {
        const uri = new URIBuilder()
                        .setProtocol(StandardProtocol.WS)
                        .setPort(8080)
                        .build();
    
        const socket = new WebsocketSubscriber(uri, 4);
        socket.reconnect(2);

        socket.on("message",(message: string) => {
            console.log(message);
        });
        socket.on("close",() => {
            console.log("Connection closed...");
        });
        socket.on("connect",() => {
        });
        
        if(!(await socket.connect())) throw new Error('Unable to start the connection!');
        recursive(socket);

        return socket;
    } catch(error) {
        console.error(error);
    }

    return null;
}

subscriber();

