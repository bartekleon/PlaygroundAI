import { useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { socket_context } from "../../socket_connection/socket";

interface ProgressType {
  image: string;
}

export const IntermediateImage = () => {
  const socket = useContext(socket_context);
  const [progress, setProgress] = useState<ProgressType>({ image: "" });

  useEffect(() => {
    const getProgress = (data: ProgressType) => {
      setProgress(data); 
    };

    socket.on("intermediate_image", getProgress);

    return () => {
      socket.off("intermediate_image", getProgress);
    };
  }, [socket]);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <img src={progress.image} width={512} height={512} />
    </Box>
  );
};
