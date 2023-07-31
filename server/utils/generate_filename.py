import secrets

def generate_filename(prompt: str):
  return f'{secrets.token_hex(4)}_{prompt}'
