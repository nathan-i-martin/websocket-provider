"use strict";
import { WebsocketProvider } from "./providers/WebsocketProvider";

export const init = () => {
    const testSocket = new WebsocketProvider(8080);

    console.log("Starting message listener...");
    testSocket.onMessage((message: string) => {
        console.log(message);
        testSocket.send("message received");
    });
    console.log("connecting...");
    testSocket.connect();

    testSocket.send("test message");
    console.log("sending the test message");
}

init();