import sys
from typing import TextIO, Callable
from typing import Protocol

from flask_socketio import SocketIO

class Progressable(Protocol):
  @staticmethod
  def progress(socket: SocketIO, text: str) -> str:
    ...

class InterceptedStdout:
  def __init__(self, original_stdout: TextIO, socket: SocketIO, callback: Callable[[SocketIO, str], str]):
    self.original_stdout = original_stdout
    self.socket = socket
    self.callback = callback

  def write(self, text: str):
    processed_text = self.callback(self.socket, text)
    self.original_stdout.write(processed_text)

  def flush(self):
    self.original_stdout.flush()

class ProgressLogger:
  def __init__(self, sio: SocketIO, cls: Progressable):
    self.sio = sio
    self.cls = cls
    self.orig_stdout = None
    self.orig_stderr = None

  def __enter__(self):
    self.orig_stdout = sys.stdout
    self.orig_stderr = sys.stderr

    sys.stderr = InterceptedStdout(self.orig_stderr, self.sio, self.cls.progress)
    sys.stdout = InterceptedStdout(self.orig_stdout, self.sio, self.cls.progress)

    return self

  def __exit__(self, exc_type, exc_val, exc_tb):
    sys.stdout = self.orig_stdout
    sys.stderr = self.orig_stderr
