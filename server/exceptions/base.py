import traceback
import os
from typing import TypedDict

class _ErrorDict(TypedDict):
  type: str
  file: str
  function: str
  location: int | None
  message: str

class BaseError(AssertionError):
  """Exception raised when an unexpected path is taken in the code."""
  def __init__(self, message):
    self.message = message
    stack = traceback.extract_stack()[-2]
    self.function = stack.name
    self.file = os.path.basename(stack.filename)
    self.location = stack.lineno
    super().__init__(self.message)

  def to_dict(self) -> _ErrorDict:
    return {
      "type": type(self).__name__,
      "file": self.file,
      "function": self.function,
      "location": self.location,
      "message": self.message,
    }

def exception_to_dict(exc):
  return {
    "type": type(exc).__name__,
    "message": str(exc),
    "traceback": traceback.format_exception(type(exc), exc, exc.__traceback__)
  }
