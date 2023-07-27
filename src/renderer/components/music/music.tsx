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
} from '@mui/material';
import { useLocalStorage } from '../../utils/useLocalStorage';
import type { TMusicVariant } from 'interfaces/queue';
import { useCallback, useContext } from 'react';
import { QueueContext } from '../../queueManager';

const variants: Record<TMusicVariant, string>  = {
  unconditioned: "Unconditioned Music Generation",
  textToMusic: "Text to Music",
  musicTextToMusic: "Music + Text to Music",
  musicContinuation: "Music Continuation",
}

function isVariant(value: string): value is TMusicVariant {
  return value in variants;
}

type TInputChangeEvent = React.ChangeEvent<HTMLInputElement>

export const Music = () => {
  const [variant, setVariant] = useLocalStorage<TMusicVariant>('AIMusic_variant', 'unconditioned');
  const [audio_length, setAudioLength] = useLocalStorage('AIMusic_length', "10");
  const [prompt, setPrompt] = useLocalStorage('AIMusic_prompt', "");
  const [audio_path, setAudioPath] = useLocalStorage('AIMusic_file', '');

  const queue = useContext(QueueContext);

  const handleVariantChange = (event: TInputChangeEvent) => {
    if (isVariant(event.target.value)) {
      setVariant(event.target.value);
    }
  };

  const handleLengthChange = (event: TInputChangeEvent) => setAudioLength(event.target.value);

  const handlePromptChange = (event: TInputChangeEvent) => setPrompt(event.target.value);

  const handleFileChange = (event: TInputChangeEvent) => {
    if (event.target.files) {
      setAudioPath(event.target.files[0].path);
    }
  };

  const handleGenerateClick = useCallback(() => {
    queue.addToQueue({
      type: 'music',
      variant,
      audio_length: +audio_length,
      audio_path,
      prompt
    })
  }, [variant, audio_length, prompt, audio_path]);

  const isMusicVariant = variant === 'musicContinuation' || variant === 'musicTextToMusic';

  return (
    <Container>
      <Typography variant="h4">AI Music Generation</Typography>

      <Box my={2}>
        <FormControl component="fieldset">
          <RadioGroup value={variant} onChange={handleVariantChange}>
            { Object.entries(variants).map(([value, label]) => {
              return <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
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

      <Box my={2} display={variant !== 'unconditioned' ? 'block' : 'none'}>
        <TextField
          label="Prompt"
          value={prompt}
          onChange={handlePromptChange}
        />
      </Box>

      <Box my={2} display={isMusicVariant ? 'block' : 'none'}>
        <Input
          type="file"
          onChange={handleFileChange}
          inputProps={{ accept: 'audio/*' }}
        />
        {audio_path && <Typography variant="body1">Selected file: {audio_path}</Typography>}
      </Box>

      <Button variant="contained" color="primary" onClick={handleGenerateClick}>
        Generate
      </Button>
    </Container>
  );
}
