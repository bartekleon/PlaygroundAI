import {
  Typography,
  Button,
  Box
} from "@mui/material";
import { useLocalStorage } from "../../utils/useLocalStorage";

export const StableDiffusionSettings = () => {
  const [models_path, setModelsPath] = useLocalStorage("AIImage_models_path", "");
  const [vaes_path, setVaesPath] = useLocalStorage("AIImage_vaes_path", "");
  const [loras_path, setLorasPath] = useLocalStorage("AIImage_loras_path", "");

  const handleModelsChange = () => {
    window.api.choosePath().then(setModelsPath);
  };
  const handleVaesChange = () => {
    window.api.choosePath().then(setVaesPath);
  };
  const handleLorasChange = () => {
    window.api.choosePath().then(setLorasPath);
  };

  const showInExplorer = (path: string) => () => {
    window.api.showInExplorer(path);
  };

  return <>
    <Box my={2}>
      <Button onClick={handleModelsChange}>Choose Models Path</Button>
      <Typography variant="body1">
        Models path:
        <Button onClick={showInExplorer(models_path)}>{models_path}</Button>
      </Typography>
    </Box>
    <Box my={2}>
      <Button onClick={handleVaesChange}>Choose Vaes Path</Button>
      <Typography variant="body1">
        Vaes path:
        <Button onClick={showInExplorer(vaes_path)}>{vaes_path}</Button>
      </Typography>
    </Box>
    <Box my={2}>
      <Button onClick={handleLorasChange}>Choose Loras Path</Button>
      <Typography variant="body1">
        Loras path:
        <Button onClick={showInExplorer(loras_path)}>{loras_path}</Button>
      </Typography>
    </Box>
  </>;
};
