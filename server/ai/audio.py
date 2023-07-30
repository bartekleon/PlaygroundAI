from typing import Tuple, Literal, TypedDict, List
from enum import Enum
from pathlib import Path
import re

from flask_socketio import SocketIO
from torch import Tensor
import torchaudio

from server.ai.base import AIBase

try:
  from audiocraft.models.musicgen import MusicGen
  from audiocraft.data.audio import audio_write
  import secrets
  _supports_audio_ai = True
except ImportError:
  _supports_audio_ai = False

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

class AudioAI(AIBase):
  def __init__(self):
    self.model: MusicGen | None = None
    
  def destroy(self):
    self.model = None
  
  def _load_audio(self, audio_path: Path) -> Tuple[Tensor, int]:
    # TODO WHAT IF AUDIO DOESN'T EXIST (front-end should handle it though)
    return torchaudio.load(audio_path) # type: ignore
      
  def _generate_unconditional(self, settings: MusicElement):
    assert self.model
    return self.model.generate_unconditional(1, True)
      
  def _generate_conditional(self, settings: MusicElement):
    assert self.model
    return self.model.generate([settings['prompt']], True)
  
  def _generate_music_to_music(self, settings: MusicElement):
    assert self.model
    audio, sample_rate = self._load_audio(settings['audio_path'])
    return self.model.generate_with_chroma(
      [settings['prompt']],
      audio[None].expand(1, -1, -1),
      sample_rate,
      True
    )
  
  def _generate_continuation(self, settings: MusicElement):
    assert self.model
    audio, sample_rate = self._load_audio(settings['audio_path'])
    return self.model.generate_continuation(
      audio,
      sample_rate,
      [settings['prompt']],
      True
    )

  def _save_audio(self, wav: Tensor, descriptions: List[str]):
    assert self.model
    for idx, one_wav in enumerate(wav):
      name = f'{secrets.token_hex(4)}_{descriptions[idx]}'
      audio_write(name, one_wav.cpu(), self.model.sample_rate, strategy="peak")

  def _generate(self, settings: MusicElement):
    variant_to_func = {
      MusicVariant.UNCONDITIONED: self._generate_unconditional,
      MusicVariant.TEXT_TO_MUSIC: self._generate_conditional,
      MusicVariant.MUSIC_TO_MUSIC: self._generate_music_to_music,
      MusicVariant.MUSIC_CONTINUATION: self._generate_continuation
    }
    variant = settings['variant']
    func = variant_to_func.get(variant, None)
    
    assert func, f"Invalid variant: {variant}"
    
    return func(settings)
          
  def generate(self, settings: MusicElement):
    if not _supports_audio_ai:
      return # TODO HANDLE PROPERLY

    if self.model is None:
      self.model = MusicGen.get_pretrained('melody')
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
  
audioAI = AudioAI()
