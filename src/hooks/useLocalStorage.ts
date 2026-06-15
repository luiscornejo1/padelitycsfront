import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicialización perezosa (lazy) para leer localStorage solo una vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Efecto para escuchar cambios
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    const handleLocalChange = () => {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleLocalChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleLocalChange);
    };
  }, [key]);

  // Función envoltorio para actualizar localStorage y state al mismo tiempo
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite funciones como setStoredValue(prev => prev + 1)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Despachar evento para notificar a otros componentes en el mismo tab
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
