from server.exceptions.base import BaseError

class UnexpectedPathError(BaseError):
  """Exception raised when an unexpected path is taken in the code."""
  def __init__(self, message="An unexpected path was taken in the code"):
    super().__init__(message)
