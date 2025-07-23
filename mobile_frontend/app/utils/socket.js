import { io } from "socket.io-client";


// Initialize socket connection
// export default socket = io("http://10.215.234.135:5000", {
//   transports: ["websocket"],
//   autoConnect: false,
// });

export default socket = io("http://192.168.227.135:5000",{
    // transports: ["websocket"],
    autoConnect: false,
    // reconnectionAttempts: 5, // Retry connection attempts
    // reconnectionDelay: 1000, // Delay between attempts
    // reconnectionDelayMax: 5000, // Max delay between attempts
    // timeout: 20000, // Connection timeout
});


