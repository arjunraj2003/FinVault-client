import { createContext, useContext, useState } from "react";

type FabAction = (() => void) | null;

const FabContext = createContext<{
  setFabAction: (action: FabAction) => void;
  fabAction: FabAction;
}>({
  setFabAction: () => {},
  fabAction: null,
});

export function FabProvider({ children }: { children: React.ReactNode }) {
  const [fabAction, setFabAction] = useState<FabAction>(null);

  return (
    <FabContext.Provider value={{ fabAction, setFabAction }}>
      {children}
    </FabContext.Provider>
  );
}

export const useFab = () => useContext(FabContext);