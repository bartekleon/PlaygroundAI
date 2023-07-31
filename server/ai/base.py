from abc import ABC, abstractmethod
    
class AIBase(ABC):
  @abstractmethod
  def generate(self, settings):
    pass

  @abstractmethod
  def destroy(self):
    pass
