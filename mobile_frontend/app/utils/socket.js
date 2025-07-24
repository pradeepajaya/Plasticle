import { io } from "socket.io-client";



export default socket = io(`${process.env.EXPO_PUBLIC_SOCKET_URL}`,{
    // transports: ["websocket"],
    autoConnect: false,
    // reconnectionAttempts: 5, // Retry connection attempts
    // reconnectionDelay: 1000, // Delay between attempts
    // reconnectionDelayMax: 5000, // Max delay between attempts
    // timeout: 20000, // Connection timeout
});


