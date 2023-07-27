import { useState, useEffect } from 'react';

export const useLocalStorage = <T = unknown>(key: string, defaultValue?: T) => {
  const readValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key '${key}':`, error);
      return defaultValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T) => {
    setStoredValue(value);
    try {
      const str = JSON.stringify(value);
      localStorage.setItem(key, str);
    } catch (error) {
      console.warn(`Error setting localStorage key '${key}':`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue] as [T, React.Dispatch<React.SetStateAction<T>>];
}
