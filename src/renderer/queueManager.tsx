import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./socket_connection/socket";
import { arraySwap } from "./utils/arraySwap";
import type { TQueue, TQueueElement } from "interfaces/queue";


const emptyFunction: () => void = () => undefined;
export const QueueContext = createContext<{
  queue: TQueue;
  currentJob: TQueueElement | undefined;
  switchElements: (index1: number, index2: number) => void;
  addToQueue: (newElement: TQueueElement) => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
}>({
  queue: [],
  currentJob: undefined,
  switchElements: emptyFunction,
  addToQueue: emptyFunction,
  pauseQueue: emptyFunction,
  resumeQueue: emptyFunction,
});


export const QueueProvider = ({ children } : { children: React.ReactNode }) => {
  const [queue, setQueue] = useState<TQueue>([]);
  const [currentJob, setCurrentJob] = useState<TQueueElement>();
  const [isPaused, setIsPaused] = useState(false);

  const socket = useContext(SocketContext);

  useEffect(() => {
    const _emitJob = () => {
      const newJob = queue.shift();
      setCurrentJob(newJob);
      setQueue([...queue]);
      socket.emit('new_job', newJob);
    }

    const emitJob = () => {
      if (!isPaused) {
        if(queue.length > 0) {
          _emitJob();
        } else {
          setCurrentJob(undefined);
        }
      }
    }

    if (currentJob === undefined && queue.length > 0 && !isPaused) {
      _emitJob();
    }

    socket.on('job_done', emitJob);

    return () => {
      socket.off('job_done', emitJob);
    };
  }, [queue, isPaused, currentJob]);

  const switchElements = (a: number, b: number) => setQueue(arraySwap([...queue], a, b));

  const addToQueue = (newElement: TQueueElement) => setQueue((prevQueue) => [...prevQueue, newElement]);

  const pauseQueue = () => setIsPaused(true);

  const resumeQueue = () => setIsPaused(false);

  return <QueueContext.Provider children={children} value={{
    queue,
    currentJob,
    switchElements,
    addToQueue,
    pauseQueue,
    resumeQueue
  }} />;
};
