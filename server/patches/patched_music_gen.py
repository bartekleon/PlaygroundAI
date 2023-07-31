from typing import List, Optional, cast

from torch import Tensor, no_grad
from flask_socketio import SocketIO

from audiocraft.models.musicgen import MusicGen
from audiocraft.modules.conditioners import ConditioningAttributes

class PatchedMusicGen(MusicGen):
  socket: SocketIO
  
  def set_generation_params(self, use_sampling: bool = True, top_k: int = 250, top_p: float = 0.0,
                            temperature: float = 1.0, duration: float = 30.0, cfg_coef: float = 3.0,
                            two_step_cfg: bool = False):
    self.generation_params = {
      'max_gen_len': int(duration * self.frame_rate),
      'use_sampling': use_sampling,
      'temp': temperature,
      'top_k': top_k,
      'top_p': top_p,
      'cfg_coef': cfg_coef,
      'two_step_cfg': two_step_cfg,
    }

  def _progress_callback(self, generated_tokens: int, tokens_to_generate: int):
    self.socket.emit('get_progress', {
      'start': generated_tokens,
      'end': tokens_to_generate,
      'percentage': generated_tokens / tokens_to_generate * 100
    })

  def _generate_tokens(self, attributes: List[ConditioningAttributes],
                        prompt_tokens: Optional[Tensor], progress: bool = True) -> Tensor:
    if prompt_tokens is not None:
      assert self.generation_params['max_gen_len'] > prompt_tokens.shape[-1], \
        "Prompt is longer than audio to generate"

    # generate by sampling from LM
    with self.autocast:
      gen_tokens = self.lm.generate(
        prompt_tokens, attributes, callback=self._progress_callback, **self.generation_params)

    # generate audio
    assert gen_tokens.dim() == 3
    with no_grad():
      gen_audio = self.compression_model.decode(gen_tokens, None) # Is actually returning a Tensor
    return cast(Tensor, gen_audio)
  
  @staticmethod
  def get_pretrained(socket: SocketIO, name: str = 'melody', device='cuda'):
    original_model = super(PatchedMusicGen, PatchedMusicGen).get_pretrained(name, device)
    patched =  PatchedMusicGen(original_model.name, original_model.compression_model, original_model.lm)
    patched.socket = socket
    
    return patched
