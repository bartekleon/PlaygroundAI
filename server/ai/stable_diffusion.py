from typing import cast

from diffusers import StableDiffusionPipeline
from diffusers.pipelines.stable_diffusion import StableDiffusionPipelineOutput
import torch

from server.ai.base import AIBase

model = ""
prompt = ""
steps = 50
image_name = ""

generator = cast(
  StableDiffusionPipeline,
  StableDiffusionPipeline.from_single_file(
    model,
    load_safety_checker=False,
    torch_dtype=torch.float16
  )
)

generator.to("cuda")

image = cast(StableDiffusionPipelineOutput, generator(
  prompt,
  num_inference_steps=steps,
)).images[0]

image.save(image_name)

class StableDiffusion(AIBase):
  def destroy(self):
    pass
  
  def generate(self):
    pass

  @staticmethod
  def progress():
    pass

stableDiffusion = StableDiffusion()
