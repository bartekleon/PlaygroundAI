from diffusers import DiffusionPipeline
import torch

base = DiffusionPipeline.from_pretrained(
  "stabilityai/stable-diffusion-xl-base-1.0",
  torch_dtype=torch.float16,
  variant="fp16",
  use_safetensors=True
)
base.to("cuda")
refiner = DiffusionPipeline.from_pretrained(
  "stabilityai/stable-diffusion-xl-refiner-1.0",
  text_encoder_2=base.text_encoder_2,
  vae=base.vae,
  torch_dtype=torch.float16,
  use_safetensors=True,
  variant="fp16",
)
refiner.to("cuda")

base.unet = torch.compile(base.unet, mode="reduce-overhead", fullgraph=True)
refiner.unet = torch.compile(refiner.unet, mode="reduce-overhead", fullgraph=True)

prompt = "Beautiful anime girl in armour"

n_steps = 40
high_noise_frac = 0.8

image = base(
  prompt=prompt,
  num_inference_steps=n_steps,
  denoising_end=high_noise_frac,
  output_type="latent",
).images

image = refiner(
  prompt=prompt,
  num_inference_steps=n_steps,
  denoising_start=high_noise_frac,
  image=image,
).images[0]
print('hello')
image.save("character.png")