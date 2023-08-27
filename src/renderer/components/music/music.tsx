import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Button,
  Input,
  Box
} from "@mui/material";
import { useLocalStorage } from "../../utils/useLocalStorage";
import type { AudioGenModelType, MusicVariantType } from "interfaces/queue";
import { useCallback, useContext } from "react";
import { queue_context } from "../../queueManager";
import { useSnackbar } from "notistack";

const variants: Record<MusicVariantType, string>  = {
  unconditioned: "Unconditioned Music Generation",
  textToMusic: "Text to Music",
  musicToMusic: "Music + Text to Music",
  musicContinuation: "Music Continuation"
};

function isVariant (value: string): value is MusicVariantType {
  return value in variants;
}

type InputChangeEventType = React.ChangeEvent<HTMLInputElement>;

export const Music = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [variant, setVariant] = useLocalStorage<MusicVariantType>("AIMusic_variant", "unconditioned");
  const [audio_length, setAudioLength] = useLocalStorage("AIMusic_length", "10");
  const [prompt, setPrompt] = useLocalStorage("AIMusic_prompt", "");
  const [audio_path, setAudioPath] = useLocalStorage("AIMusic_file", "");
  const [model] = useLocalStorage<AudioGenModelType>("AIMusic_model", "melody");

  const queue = useContext(queue_context);

  const handleVariantChange = (event: InputChangeEventType) => {
    if (isVariant(event.target.value)) {
      setVariant(event.target.value);
    }
  };

  const handleLengthChange = (event: InputChangeEventType) => {
    setAudioLength(event.target.value); 
  };

  const handlePromptChange = (event: InputChangeEventType) => {
    setPrompt(event.target.value); 
  };

  const handleFileChange = (event: InputChangeEventType) => {
    if (event.target.files?.[0]) {
      setAudioPath(event.target.files[0].path);
    }
  };

  const handleGenerateClick = useCallback(() => {
    queue.addToQueue({
      type: "music",
      variant,
      audio_length: +audio_length,
      audio_path,
      prompt,
      model
    });
    enqueueSnackbar({
      message: `Added to queue. Currently ${queue.length() + 1} elements in queue`,
      variant: "info"
    });
  }, [variant, audio_length, prompt, audio_path, queue, model]);

  const is_music_variant = variant === "musicContinuation" || variant === "musicToMusic";

  return (
    <Container>
      <Typography variant="h4">AI Music Generation</Typography>

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
          label="Audio Length"
          value={audio_length}
          onChange={handleLengthChange}
        />
      </Box>

      <Box my={2} display={variant !== "unconditioned" ? "block" : "none"}>
        <TextField
          label="Prompt"
          value={prompt}
          onChange={handlePromptChange}
        />
      </Box>

      <Box my={2} display={is_music_variant ? "block" : "none"}>
        <Input
          type="file"
          onChange={handleFileChange}
          inputProps={{ accept: "audio/*" }}
        />
        {audio_path && <Typography variant="body1">Selected file: {audio_path}</Typography>}
      </Box>

      <Button variant="contained" color="primary" onClick={handleGenerateClick}>
        Generate
      </Button>
    </Container>
  );
};
