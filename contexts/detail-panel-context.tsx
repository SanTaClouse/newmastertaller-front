"use client";

import { createContext, useContext, useState } from "react";

interface DetailPanelContextValue {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const DetailPanelContext = createContext<DetailPanelContextValue>({
  isOpen: false,
  setIsOpen: () => {},
});

export function useDetailPanel() {
  return useContext(DetailPanelContext);
}

export function DetailPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DetailPanelContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DetailPanelContext.Provider>
  );
}
