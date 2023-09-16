from enum import Enum
from typing import List, Literal, TypedDict, cast
import torch
from flask_socketio import SocketIO

from server.ai.stable_diffusion import image_to_b64

try:
  from diffusers import DiffusionPipeline, StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline
  from diffusers.pipelines.stable_diffusion_xl import StableDiffusionXLPipelineOutput 
  from PIL.Image import Image
  _supports_stable_diffusion_xl = True
except ImportError:
  _supports_stable_diffusion_xl = False

from server.ai.base import AIBase
from server.utils.generate_filename import generate_filename

class ImageVariant(str, Enum):
  TEXT_TO_IMAGE = 'txt2img'

class ImageElementXL(TypedDict):
  type: Literal['imagexl']
  variant: ImageVariant
  # model: Path
  prompt: str
  # negative_prompt: str
  # steps: int

n_steps = 40
high_noise_frac = 0.8

class StableDiffusionXL(AIBase):
  def __init__(self, socket: SocketIO):
    self.model: StableDiffusionXLPipeline | None = None
    self.refiner: StableDiffusionXLImg2ImgPipeline | None = None
    self.socket = socket
    self.settings: ImageElementXL
    self.use_refiner = False
    
  def destroy(self):
    self.model = None
    self.refiner = None

  def _send_preview(self, step: int, timestep: int, latents: torch.FloatTensor):
    assert self.model

    if step % 5 == 0:
      pass
      # image = self.model.vae.decode(latents / self.model.vae.config.scaling_factor, return_dict=False)[0]
      # do_denormalize = [True] * image.shape[0]
      # image = cast(List[Image], self.model.image_processor.postprocess(image, do_denormalize=do_denormalize))
      # self.socket.emit('intermediate_image', { 'image': image_to_b64(image[0]) })

    self.socket.emit('get_progress', {
      'start': step,
      'end': n_steps,
      'percentage': step / n_steps * 100
    })
  
  def _load_model(self):
    base = cast(StableDiffusionXLPipeline, StableDiffusionXLPipeline.from_pretrained(
      "stabilityai/stable-diffusion-xl-base-1.0",
      torch_dtype=torch.float16,
      variant="fp16",
      use_safetensors=True
    ))
    # base.to("cuda")
    base.enable_model_cpu_offload()
    refiner = None
    if self.use_refiner:
      refiner = cast(StableDiffusionXLImg2ImgPipeline, DiffusionPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-refiner-1.0",
        text_encoder_2=base.text_encoder_2,
        vae=base.vae,
        torch_dtype=torch.float16,
        use_safetensors=True,
        variant="fp16",
      ))
      refiner.enable_model_cpu_offload()
    return base, refiner
    
  def _generate(self, settings: ImageElementXL):
    self.settings = settings
    if self.model is None:
      self.model, self.refiner = self._load_model()
    
    output = cast(StableDiffusionXLPipelineOutput, self.model(
      prompt=settings["prompt"],
      num_inference_steps=n_steps,
      denoising_end=high_noise_frac if self.use_refiner else None,
      guidance_scale=7,
      callback=self._send_preview
    ))
    
    image = cast(Image, output.images[0])
    
    if self.refiner:
      image = cast(StableDiffusionXLPipelineOutput, self.refiner(
        prompt=settings["prompt"],
        num_inference_steps=n_steps,
        denoising_start=high_noise_frac,
        image=image,
        guidance_scale=7,
        callback=self._send_preview
      ))
      image = cast(Image, output.images[0])

    image.save(f"{generate_filename(settings['prompt'])}.png", format='png')

  def generate(self, settings: ImageElementXL):
    if not _supports_stable_diffusion_xl:
      return
    
    self._generate(settings)
