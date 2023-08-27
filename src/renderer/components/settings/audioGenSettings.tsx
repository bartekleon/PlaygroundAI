import type { SelectChangeEvent } from "@mui/material";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import { useLocalStorage } from "../../utils/useLocalStorage";
import type { AudioGenModelType } from "interfaces/queue";

const audiogen_models: AudioGenModelType[] = ["small", "medium", "melody", "large"];

const ModelSelect = () => {
  const [model, setModel] = useLocalStorage<AudioGenModelType>("AIMusic_model", "melody");

  const handleModelChange = (event: SelectChangeEvent) => {
    const value = event.target.value;

    if (value in audiogen_models) {
      setModel(value as unknown as AudioGenModelType);
    }
  };

  return (
    <Box my={2}>
      <FormControl fullWidth>
        <InputLabel>Model</InputLabel>
        <Select onChange={handleModelChange}
          value={model}
          label="Model">

          { audiogen_models.map(model_name => {
            return <MenuItem key={model_name} value={model_name}>{model_name}</MenuItem>;
          }) }
        </Select>
      </FormControl>
    </Box>
  );
};

export const AudioGenSettings = () => {
  return <>
    <ModelSelect />
  </>;
};
