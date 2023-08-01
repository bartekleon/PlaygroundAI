import { useContext, useEffect } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from "@mui/material/Box";

import { MiniDrawer } from "./menu/menu";
import { DrawerHeader } from "./menu/drawer";
import { QueueProvider } from "../queueManager";
import { ProgressBar } from './progressbar/progressbar';
import { SocketContext } from '../socket_connection/socket';
import { Router } from './router';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const DEBUG = true;

export const Main = () => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    const getAny = (event: string, args: unknown[]) => {
      console.log(event, args);
    }
    const getError = (event: string, args: unknown[]) => {
      console.log(event, args);
    }
    const modelStatusChange = (data: { status: string }) => {
      enqueueSnackbar({
        message: data.status,
        variant: 'info',
      });
    }

    socket.on('error', getError);
    socket.on('model_status_change', modelStatusChange);
    if (DEBUG) {
      socket.onAny(getAny);
      socket.onAnyOutgoing(getAny);
    }

    return () => {
      socket.off('model_status_change', modelStatusChange)
      socket.off('error', getError)
      if (DEBUG) {
        socket.offAny(getAny);
        socket.offAnyOutgoing(getAny)
      }
    }
  }, [socket, enqueueSnackbar])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <MiniDrawer />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <QueueProvider>
            <SnackbarProvider maxSnack={5}>
              <Router />
            </SnackbarProvider>
          </QueueProvider>
          <ProgressBar />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
