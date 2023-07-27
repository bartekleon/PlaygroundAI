import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';

export const socket: Socket = io('http://localhost:5000');
export const SocketContext = createContext(socket);
