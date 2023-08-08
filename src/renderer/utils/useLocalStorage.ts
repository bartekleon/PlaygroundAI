import { useState, useEffect } from "react";

type SetValueType<Type> = React.Dispatch<React.SetStateAction<Type>>;

export function useLocalStorage<Type> (key: string): [Type | null, SetValueType<Type>];
export function useLocalStorage<Type> (key: string, default_value: Type): [Type, SetValueType<Type>];
export function useLocalStorage<Type = unknown> (key: string, default_value?: Type) {
  const readValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as Type : default_value ?? null;
    } catch (error) {
      console.warn(`Error reading localStorage key '${key}':`, error);
      return default_value ?? null;
    }
  };

  const [stored_value, setStoredValue] = useState<Type | null>(readValue);

  const setValue = (value: Type) => {
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

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return [stored_value, setValue];
}
