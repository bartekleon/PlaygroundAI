from abc import ABC, abstractmethod
from flask_socketio import SocketIO
    
class AIBase(ABC):
  @abstractmethod
  def generate(self, settings):
    pass

  @staticmethod
  @abstractmethod
  def progress(socket: SocketIO, text: str) -> str:
    pass

  @abstractmethod
  def destroy(self):
    pass
