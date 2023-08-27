import {
  Typography,
  Button,
  Box
} from "@mui/material";
import { useLocalStorage } from "../../utils/useLocalStorage";

const ModelSelector = ({ value }: { value: string }) => {
  const local_storage_key = `AIImage_${value.toLowerCase()}_path`;

  const [models_path, setModelsPath] = useLocalStorage(local_storage_key, "");

  const handleModelsChange = () => {
    window.api.choosePath().then(setModelsPath);
  };
  
  const showInExplorer = (path: string) => () => {
    window.api.showInExplorer(path);
  };

  return (
    <Box my={2}>
      <Button onClick={handleModelsChange}>Choose {value} Path</Button>
      <Typography variant="body1">
        {value} path:
        <Button onClick={showInExplorer(models_path)}>{models_path}</Button>
      </Typography>
    </Box>
  );
};

export const StableDiffusionSettings = () => {
  return <>
    <ModelSelector value='Models' />
    <ModelSelector value='Vaes' />
    <ModelSelector value='Loras' />
  </>;
};
