import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from "@mui/material/Box";

import { MiniDrawer } from "./menu/menu";
import { DrawerHeader } from "./menu/drawer";
import { Music } from "./music/music";
import { QueueProvider } from "../queueManager";
import { Installer } from './installer/installer';
import { ProgressBar } from './progressbar/progressbar';
import { useContext, useEffect } from 'react';
import { SocketContext } from '../socket_connection/socket';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const Main = () => {
  const socket = useContext(SocketContext)

  useEffect(() => {
    const getProgress = (event: string, args: unknown[]) => {
      console.log(event, args);
    }
    socket.onAny(getProgress)
    socket.onAnyOutgoing(getProgress)

    return () => {
      socket.offAny(getProgress)
      socket.offAnyOutgoing(getProgress)
    }
  }, [socket])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <MiniDrawer />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <QueueProvider>
            <Routes>
              <Route element={<Music />} path="/" />
              <Route element={<Music />} path="/music" />
              <Route element={<Installer />} path="/installation" />
              <Route element={<></>} path="/test3" />
              <Route element={<></>} path="/test4" />
              <Route element={<></>} path="/test5" />
              <Route element={<></>} path="/test6" />
            </Routes>
          </QueueProvider>
          <ProgressBar />
        </Box>
      </Box>
    </ThemeProvider>
  );
}