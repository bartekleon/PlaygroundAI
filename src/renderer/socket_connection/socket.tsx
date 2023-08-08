import { createContext } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

export const socket: Socket = io("http://localhost:5000");
export const socket_context = createContext(socket);
