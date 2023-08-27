from enum import Enum
from pathlib import Path
from typing import Literal, TypedDict, cast, List
from io import BytesIO
import base64

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
  negative_prompt: str
  steps: int

def image_to_b64(image):
  image_file = BytesIO()
  image.save(image_file, format='PNG')
  im_bytes = image_file.getvalue()
  imgb64 = base64.b64encode(im_bytes)
  return 'data:image/png;base64,' + str(imgb64)[2:-1]

class StableDiffusion(AIBase):
  def __init__(self, socket: SocketIO):
    self.model: StableDiffusionPipeline | None = None
    self.model_name: str = ""
    self.socket = socket
    self.settings: ImageElement
  
  def destroy(self):
    self.model = None
    pass
  
  def _load_model(self):
    if self.model and self.model_name == self.settings['model']:
      return self.model
      
    _model = cast(StableDiffusionPipeline, StableDiffusionPipeline.from_single_file(
      self.settings['model'],
      load_safety_checker=False,
      torch_dtype=torch.float16
    ))
    _model.to("cuda")
    
    return _model
  
  # timestep is torch.FloatTensor
  def _send_preview(self, step: int, timestep: int, latents: torch.FloatTensor):
    assert self.model

    if step % 5 == 0:
      image = self.model.vae.decode(latents / self.model.vae.config.scaling_factor, return_dict=False)[0]
      do_denormalize = [True] * image.shape[0]
      image = cast(List[Image], self.model.image_processor.postprocess(image, do_denormalize=do_denormalize))
      self.socket.emit('intermediate_image', { 'image': image_to_b64(image[0]) })

    self.socket.emit('get_progress', {
      'start': step,
      'end': self.settings['steps'],
      'percentage': step / self.settings['steps'] * 100
    })
  
  def _generate(self, settings: ImageElement):
    self.settings = settings
    self.model = self._load_model()
      
    output = cast(StableDiffusionPipelineOutput, self.model(
      prompt=settings['prompt'],
      negative_prompt=settings['negative_prompt'],
      num_inference_steps=settings['steps'],
      callback=self._send_preview
    ))
    
    image = cast(Image, output.images[0])

    image.save(f"{generate_filename(settings['prompt'])}.png", format='png')
  
  def generate(self, settings: ImageElement):
    if not _supports_stable_diffusion:
      return
    
    self._generate(settings)
