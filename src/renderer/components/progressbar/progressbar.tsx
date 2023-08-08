import { useContext, useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { socket_context } from "../../socket_connection/socket";

interface ProgressType {
  start: number;
  end: number;
  percentage: number;
}

export const ProgressBar = () => {
  const socket = useContext(socket_context);
  const [progress, setProgress] = useState<ProgressType>({ start: 0, end: 0, percentage: 0 });

  useEffect(() => {
    const getProgress = (data: ProgressType) => {
      setProgress(data); 
    };

    socket.on("get_progress", getProgress);
    socket.on("error", getProgress);

    return () => {
      socket.off("get_progress", getProgress);
      socket.off("error", getProgress);
    };
  }, [socket]);

  if (progress.start === progress.end) {
    return <></>;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" value={progress.percentage} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {`${progress.start} / ${progress.end}`}
        </Typography>
      </Box>
    </Box>
  );
};
