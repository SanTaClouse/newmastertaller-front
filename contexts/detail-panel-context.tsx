"use client";

import { createContext, useContext, useState } from "react";

interface DetailPanelContextValue {
  isOpen: boolean;
  panelWidth: number;
  setIsOpen: (v: boolean, width?: number) => void;
}

const DetailPanelContext = createContext<DetailPanelContextValue>({
  isOpen: false,
  panelWidth: 420,
  setIsOpen: () => {},
});

export function useDetailPanel() {
  return useContext(DetailPanelContext);
}

export function DetailPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpenState] = useState(false);
  const [panelWidth, setPanelWidth] = useState(420);

  const setIsOpen = (v: boolean, width = 420) => {
    setIsOpenState(v);
    if (v) setPanelWidth(width);
  };

  return (
    <DetailPanelContext.Provider value={{ isOpen, panelWidth, setIsOpen }}>
      {children}
    </DetailPanelContext.Provider>
  );
}
