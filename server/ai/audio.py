from typing import Tuple, Literal, TypedDict, List
from enum import Enum
from pathlib import Path
import re

from flask_socketio import SocketIO
from torch import Tensor
import torchaudio
from audiocraft.models.musicgen import MusicGen
from audiocraft.data.audio import audio_write
import secrets

class MusicVariant(str, Enum):
    UNCONDITIONED = "unconditioned"
    TEXT_TO_MUSIC = "textToMusic"
    MUSIC_TO_MUSIC = "musicToMusic"
    MUSIC_CONTINUATION = "musicContinuation"

class MusicElement(TypedDict):
    type: Literal['music']
    variant: MusicVariant
    audio_length: float
    audio_path: Path
    prompt: str

# TODO HANDLE PROGRESS

class AudioAI():
    # TODO HANDLE UNLOAD
    
    def __init__(self):
        self.model = MusicGen.get_pretrained('melody')
    
    def _load_audio(self, audio_path: Path) -> Tuple[Tensor, int]:
         # TODO WHAT IF AUDIO DOESN'T EXIST
        return torchaudio.load(audio_path) # type: ignore
        
    def _generate_unconditional(self):
        return self.model.generate_unconditional(4, True)
        
    def _generate_conditional(self, descriptions: List[str]):
        return self.model.generate(descriptions, True)
    
    def _generate_music_to_music(self, descriptions: List[str], audio: Tensor, sample_rate: int):
        return self.model.generate_with_chroma(
            descriptions,
            audio[None].expand(len(descriptions), -1, -1),
            sample_rate,
            True
        )
    
    def _generate_continuation(self, descriptions: List[str], audio: Tensor, sample_rate: int):
        return self.model.generate_continuation(
            audio,
            sample_rate,
            descriptions, # type: ignore
            True
        )
    
    def _save_audio(self, wav: Tensor, descriptions: List[str]):
        for idx, one_wav in enumerate(wav):
            name = f'{secrets.token_hex(4)}_{descriptions[idx]}'
            audio_write(name, one_wav.cpu(), self.model.sample_rate, strategy="peak")
            
    def _generate(self, settings: MusicElement):
        variant = settings['variant']
        
        if variant == MusicVariant.UNCONDITIONED:
            return self._generate_unconditional()
        
        prompts = [settings['prompt']]

        if variant == MusicVariant.TEXT_TO_MUSIC:
            return self._generate_conditional(prompts)
        
        audio, sample_rate = self._load_audio(settings['audio_path'])
            
        if variant == MusicVariant.MUSIC_TO_MUSIC:
            return self._generate_music_to_music(prompts, audio, sample_rate)
            
        if variant == MusicVariant.MUSIC_CONTINUATION:
            return self._generate_continuation(prompts, audio, sample_rate)
        
        raise # TODO MAKE IT A PROPER ERROR
            
    def generate(self, settings: MusicElement):
        self.model.set_generation_params(duration=settings['audio_length'])
        
        audio = self._generate(settings)
        
        self._save_audio(audio, [settings['prompt']])
    
    @staticmethod
    def extract_tokens(text: str):
        match = re.search(r'(\d+) +\/ +(\d+)', text)
        if match:
            generated_tokens, tokens_to_generate = map(int, match.groups())
            return generated_tokens, tokens_to_generate
        return None, None
    
    @staticmethod
    def progress(socket: SocketIO, text: str):
        # print(f'{generated_tokens: 6d} / {tokens_to_generate: 6d}', end='\r')
        if 'OutOfMemoryError' in text:
            socket.emit('status', 'Cuda Out of Memory Error')
        else:
            start, end = AudioAI.extract_tokens(text)
            if start is not None and end is not None:
                percentage = start / end * 100
                socket.emit('get_progress', { 'start': start, 'end': end, 'percentage': percentage })

        return text
