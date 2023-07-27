export const arraySwap = <T>(array: T[], index1: number, index2: number) => {
  [array[index1], array[index2]] = [array[index2], array[index1]];
  return array;
};
