import { useContext, useEffect } from "react";
import { SnackbarProvider, enqueueSnackbar } from "notistack";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import { MiniDrawer } from "./menu/menu";
import { DrawerHeader } from "./menu/drawer";
import { QueueProvider } from "../queueManager";
import { ProgressBar } from "./progressbar/progressbar";
import { socket_context } from "../socket_connection/socket";
import { Router } from "./router";

const dark_theme = createTheme({
  palette: {
    mode: "dark"
  }
});

const IS_DEBUG = true;

export const Main = () => {
  const socket = useContext(socket_context);

  useEffect(() => {
    const getAny = (event: string, args: unknown[]) => {
      console.log(event, args);
    };
    const getError = (event: string, args: unknown[]) => {
      console.log(event, args);
    };
    const modelStatusChange = (data: { status: string }) => {
      enqueueSnackbar({
        message: data.status,
        variant: "info"
      });
    };

    socket.on("error", getError);
    socket.on("model_status_change", modelStatusChange);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (IS_DEBUG) {
      socket.onAny(getAny);
      socket.onAnyOutgoing(getAny);
    }

    return () => {
      socket.off("model_status_change", modelStatusChange);
      socket.off("error", getError);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (IS_DEBUG) {
        socket.offAny(getAny);
        socket.offAnyOutgoing(getAny);
      }
    };
  }, [socket, enqueueSnackbar]);

  return (
    <ThemeProvider theme={dark_theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
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
};
