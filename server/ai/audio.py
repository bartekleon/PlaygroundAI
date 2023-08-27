from typing import Tuple, Literal, TypedDict, Callable, Dict
from enum import Enum
from pathlib import Path

from torch import Tensor
import torchaudio
from flask_socketio import SocketIO

from server.ai.base import AIBase
from server.utils.generate_filename import generate_filename

try:
  from audiocraft.models.musicgen import MusicGen
  from audiocraft.data.audio import audio_write
  _supports_audio_ai = True
  
except ImportError as exc:
  print(exc)
  _supports_audio_ai = False

class MusicVariant(str, Enum):
  UNCONDITIONED = "unconditioned"
  TEXT_TO_MUSIC = "textToMusic"
  MUSIC_TO_MUSIC = "musicToMusic"
  MUSIC_CONTINUATION = "musicContinuation"

class MusicModel(str, Enum):
  LARGE = "large"
  MEDIUM = "medium"
  MELODY = "melody"
  SMALL = "small"

class MusicElement(TypedDict):
  type: Literal['music']
  variant: MusicVariant
  audio_length: float
  audio_path: Path
  prompt: str
  model: MusicModel

class AudioAI(AIBase):
  def __init__(self, socket: SocketIO):
    self.model: MusicGen | None = None
    self.socket = socket
    self.last_model = 'melody'
    
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

  def _save_audio(self, wav: Tensor, prompt: str):
    assert self.model
    for _, one_wav in enumerate(wav):
      audio_write(generate_filename(prompt), one_wav.cpu(), self.model.sample_rate, strategy="peak")

  def _generate(self, settings: MusicElement):
    variant_to_func: Dict[MusicVariant, Callable[[MusicElement], Tensor]] = {
      MusicVariant.UNCONDITIONED: self._generate_unconditional,
      MusicVariant.TEXT_TO_MUSIC: self._generate_conditional,
      MusicVariant.MUSIC_TO_MUSIC: self._generate_music_to_music,
      MusicVariant.MUSIC_CONTINUATION: self._generate_continuation
    }
    variant = settings['variant']
    func = variant_to_func.get(variant, None)
    
    assert func, f"Invalid variant: {variant}"
    
    return func(settings)
  
  def _progress_callback(self, generated_tokens: int, tokens_to_generate: int):
    self.socket.emit('get_progress', {
      'start': generated_tokens,
      'end': tokens_to_generate,
      'percentage': generated_tokens / tokens_to_generate * 100
    })
          
  def generate(self, settings: MusicElement):
    if not _supports_audio_ai:
      return # TODO HANDLE PROPERLY

    if self.model is None or self.last_model != settings['model']:
      self.socket.emit('model_status_change', { 'status': 'Loading Audio model' })
      self.model = MusicGen.get_pretrained(settings['model'])
      self.model.set_custom_progress_callback(self._progress_callback)
      self.socket.emit('model_status_change', { 'status': 'Loading Audio model finished' })
    self.model.set_generation_params(duration=settings['audio_length'])
    
    self.socket.emit('model_status_change', { 'status': 'Generating...' })
    audio = self._generate(settings)
    
    self._save_audio(audio, settings['prompt'])
