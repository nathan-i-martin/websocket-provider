# WebSocket Provider

This WebSocket provider gives a simple and easy way to setup a websocket server using Node.JS!

Creating a new WebSocket instance is as easy as calling `new WebsocketProvider(port)` you can then set parameters and event listeners.
```javascript
const socket = new WebsocketProvider(8080);

socket.on("message",(message: string) => {
    console.log(message);
    socket.send("Message received. Chat Provider 1");
});

socket.connect();
```
---
## Event Listeners
There are four events that you can listen for; `connect`, `message`, `close`, and `error`.
> **NOTE:** Event listeners must be defined before you start the WebSocket connection

### `connect`
```javascript
socket.on('connect',(connection: WebSocket) => {
    
});
```
### `message`
```javascript
socket.on('message',(message: string) => {
    
});
```
### `close`
```javascript
socket.on('close',() => {
    
});
```
### `error`
```javascript
socket.on('error',() => {
    
});
```
---
## Methods
### `.connect()`
Open the WebSocket connection.
### `.send()`
Send a message over the connection.
- *param* `message` - The message to be sent.
- *throws* - An error if you try to send a message when the connection is closed.
### `.shouldReconnect()`
Sets whether or not the WebSocket should attempt to reconnect if it get's disconnected.
- *param* `shouldReconnect` - Should the WebSocket attempt to reconnect if it disconnects.
- *throws* - An error if you try to set this while the WebSocket is already connected.
### `.ping()`
Ping the connection.
- *throws* - An error if you try to ping the connection while it's closed.
### `.close()`
Close the connection. If you have `.shouldReconnect()` set to `true` this connection will reopen immediately after closing. If you want to permanently close the connection, use .`kill()` instead.
### `.kill()`
Kill the connection. The only difference between this and `.close()` is that if `.shouldReconnect()` is set to `true` this will force it to close until it is reopened with `.connect()`.
