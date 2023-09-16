import type {
  SelectChangeEvent
} from "@mui/material";
import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel
} from "@mui/material";
import { useLocalStorage } from "../../utils/useLocalStorage";
import type { ImageVariantType } from "interfaces/queue";
import { useCallback, useContext, useEffect, useState } from "react";
import { queue_context } from "../../queueManager";
import { useSnackbar } from "notistack";
import type { FilePathType } from "interfaces/getFiles";
import { IntermediateImage } from "../progressbar/intermediateImage";

const variants: Record<ImageVariantType, string>  = {
  txt2img: "Text to image",
  img2img: "Image to image",
  inpainting: "Inpainting"
};

function isVariant (value: string): value is ImageVariantType {
  return value in variants;
}

type InputChangeEventType = React.ChangeEvent<HTMLInputElement>;

const ModelSelect = () => {
  const [model, setModel] = useLocalStorage("AIImage_model", "");
  const [models_path] = useLocalStorage("AIImage_models_path", "");
  const [available_models, setAvailableModels] = useState<FilePathType[]>([]);

  useEffect(() => {
    const eventOff = window.api.modelsChange((_, models) => {
      setAvailableModels(models);
    });

    return () => {
      eventOff();
    };
  }, []);

  useEffect(() => {
    window.api.modelsFolder(models_path);
  }, [models_path]);

  const handleModelChange = (event: SelectChangeEvent) => {
    if (event.target.value) {
      setModel(event.target.value);
    }
  };

  return (
    <Box my={2}>
      <FormControl fullWidth>
        <InputLabel>Model</InputLabel>
        <Select onChange={handleModelChange}
          value={model}
          label="Model">

          { available_models.map(ckpt => {
            return <MenuItem key={ckpt.full_path} value={ckpt.full_path}>{ckpt.relative_path}</MenuItem>;
          }) }
        </Select>
      </FormControl>
    </Box>
  );
};

export const StableDiffusionXL = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [variant, setVariant] = useLocalStorage<ImageVariantType>("AIImage_variant", "txt2img");
  const [steps, setSteps] = useLocalStorage("AIImage_steps", "30");
  const [prompt, setPrompt] = useLocalStorage("AIImage_prompt", "");
  const [negative_prompt, setNegativePrompt] = useLocalStorage("AIImage_negative_prompt", "");
  const [model] = useLocalStorage("AIImage_model", "");

  const queue = useContext(queue_context);

  const handleVariantChange = (event: InputChangeEventType) => {
    if (isVariant(event.target.value)) {
      setVariant(event.target.value);
    }
  };

  const handleStepsChange = (event: InputChangeEventType) => {
    setSteps(event.target.value); 
  };

  const handlePromptChange = (event: InputChangeEventType) => {
    setPrompt(event.target.value); 
  };

  const handleNegativePromptChange = (event: InputChangeEventType) => {
    setNegativePrompt(event.target.value); 
  };

  const handleGenerateClick = useCallback(() => {
    queue.addToQueue({
      type: "imagexl",
      variant,
      model,
      prompt,
      steps: +steps,
      negative_prompt
    });
    enqueueSnackbar({
      message: `Added to queue. Currently ${queue.length() + 1} elements in queue`,
      variant: "info"
    });
  }, [variant, steps, prompt, queue, negative_prompt]);

  return (
    <Container>
      <Typography variant="h4">AI Image XL Generation</Typography>

      <Box my={2}>
        <FormControl component="fieldset">
          <RadioGroup value={variant} onChange={handleVariantChange}>
            { Object.entries(variants).map(([value, label]) => {
              return <FormControlLabel key={value} value={value} control={<Radio />} label={label} />;
            }) }
          </RadioGroup>
        </FormControl>
      </Box>

      <Box my={2}>
        <TextField
          type="number"
          label="Steps"
          value={steps}
          onChange={handleStepsChange}
        />
      </Box>

      <Box my={2}>
        <TextField
          label="Prompt"
          value={prompt}
          onChange={handlePromptChange}
        />
      </Box>

      <Box my={2}>
        <TextField
          label="Negative Prompt"
          value={negative_prompt}
          onChange={handleNegativePromptChange}
        />
      </Box>

      <ModelSelect />

      <Button variant="contained" color="primary" onClick={handleGenerateClick}>
        Generate
      </Button>

      <IntermediateImage />
    </Container>
  );
};
