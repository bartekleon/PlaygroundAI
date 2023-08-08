import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { socket_context } from "./socket_connection/socket";
import { arraySwap } from "./utils/arraySwap";
import type { QueueType, QueueElementType } from "interfaces/queue";

const emptyFunction: () => void = () => undefined;

interface QueueContextType {
  queue: QueueType;
  current_job: QueueElementType | undefined;
  switchElements: (index1: number, index2: number) => void;
  addToQueue: (newElement: QueueElementType) => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  length: () => number;
}

export const queue_context = createContext<QueueContextType>({
  queue: [],
  current_job: undefined,
  switchElements: emptyFunction,
  addToQueue: emptyFunction,
  pauseQueue: emptyFunction,
  resumeQueue: emptyFunction,
  length: () => 0
});

export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [queue, setQueue] = useState<QueueType>([]);
  const [current_job, setCurrentJob] = useState<QueueElementType>();
  const [is_paused, setIsPaused] = useState(false);

  const socket = useContext(socket_context);

  useEffect(() => {
    const emitJob = () => {
      const new_job = queue.shift();
      setCurrentJob(new_job);
      setQueue([...queue]);
      socket.emit("new_job", new_job);
    };

    const socketEmitJob = () => {
      if (!is_paused) {
        if (queue.length > 0) {
          emitJob();
        } else {
          setCurrentJob(undefined);
        }
      }
    };

    if (current_job === undefined && queue.length > 0 && !is_paused) {
      emitJob();
    }

    socket.on("job_done", socketEmitJob);

    return () => {
      socket.off("job_done", socketEmitJob);
    };
  }, [queue, is_paused, current_job]);

  const length = useCallback(() => current_job ? queue.length + 1 : queue.length, [queue, current_job]);

  const switchElements = (a: number, b: number) => {
    setQueue(arraySwap([...queue], a, b)); 
  };

  const addToQueue = (new_element: QueueElementType) => {
    setQueue((prev_queue) => [...prev_queue, new_element]); 
  };

  const pauseQueue = () => {
    setIsPaused(true); 
  };

  const resumeQueue = () => {
    setIsPaused(false); 
  };

  return <queue_context.Provider children={children} value={{
    queue,
    current_job,
    switchElements,
    addToQueue,
    pauseQueue,
    resumeQueue,
    length
  }} />;
};
