from enum import Enum
from pathlib import Path
from typing import Literal, TypedDict, cast

import torch
from flask_socketio import SocketIO

try:
  from diffusers import StableDiffusionPipeline
  from diffusers.pipelines.stable_diffusion import StableDiffusionPipelineOutput
  from PIL.Image import Image
  _supports_stable_diffusion = True
except ImportError:
  _supports_stable_diffusion = False

from server.ai.base import AIBase
from server.utils.generate_filename import generate_filename

class ImageVariant(str, Enum):
  TEXT_TO_IMAGE = 'txt2img'

class ImageElement(TypedDict):
  type: Literal['image']
  variant: ImageVariant
  model: Path
  prompt: str
  steps: int

class StableDiffusion(AIBase):
  def __init__(self, socket: SocketIO):
    self.model: StableDiffusionPipeline | None = None
    self.socket = socket
  
  def destroy(self):
    self.model = None
    pass
  
  def _load_model(self, settings: ImageElement):
    _model = cast(StableDiffusionPipeline, StableDiffusionPipeline.from_single_file(
      settings['model'],
      load_safety_checker=False,
      torch_dtype=torch.float16
    ))
    _model.to("cuda")
    
    return _model
  
  def _send_preview(self, step: int, timestep: int, latents: torch.FloatTensor):
    assert self.model
    if step % 5 == 0:
      image = cast(Image, self.model.image_processor.postprocess(latents))
      self.socket.emit('intermediate_image', { 'image': image })
    
    self.socket.emit('get_progress', {
      'start': step,
      'end': timestep,
      'percentage': step / timestep * 100
    })
  
  def _generate(self, settings: ImageElement):
    self.model = self._load_model(settings)
      
    output = cast(StableDiffusionPipelineOutput, self.model(
      settings['prompt'],
      num_inference_steps=settings['steps'],
      callback=self._send_preview
    ))
    
    image = cast(Image, output.images[0])

    image.save(generate_filename(settings['prompt']), format='png')
  
  def generate(self, settings: ImageElement):
    if not _supports_stable_diffusion:
      return
    
    self._generate(settings)
