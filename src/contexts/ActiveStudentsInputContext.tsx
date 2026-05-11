import { createContext, useContext, useState, type ReactNode } from 'react';

interface ActiveStudentsInputContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ActiveStudentsInputContext = createContext<ActiveStudentsInputContextValue | null>(null);

export function ActiveStudentsInputProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ActiveStudentsInputContext.Provider value={{ open, setOpen }}>
      {children}
    </ActiveStudentsInputContext.Provider>
  );
}

export function useActiveStudentsInput() {
  const ctx = useContext(ActiveStudentsInputContext);
  return ctx;
}
