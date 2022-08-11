"use strict";
import { WebsocketProvider } from "./providers/WebsocketProvider";

const websockets: WebsocketProvider[] = [];

const chatProvider = (): WebsocketProvider => {
    const socket = new WebsocketProvider(8080);

    socket.on("message",(message: string) => {
        console.log(message);
        socket.send("Message received. Chat Provider 1");
    });

    socket.connect();

    return socket;
}

const secondChatProvider = (): WebsocketProvider => {
    const socket = new WebsocketProvider(8081);

    socket.shouldReconnect(true);

    socket.on("message",(message: string) => {
        console.log(message);
        socket.send("Message received. Chat Provider 2");
    });

    socket.connect();

    return socket;
}

export const init = () => {
    websockets.push(chatProvider());
    websockets.push(secondChatProvider());
}

init();