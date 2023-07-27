from test_install import test_install

def _import_torch():
  import torch

print(test_install(_import_torch))
