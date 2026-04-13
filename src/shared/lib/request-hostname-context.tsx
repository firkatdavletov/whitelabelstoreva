"use client";

import { createContext, useContext } from "react";

const RequestHostnameContext = createContext<string | null>(null);

type RequestHostnameProviderProps = {
  children: React.ReactNode;
  hostname: string | null;
};

export function RequestHostnameProvider({
  children,
  hostname,
}: RequestHostnameProviderProps) {
  return (
    <RequestHostnameContext.Provider value={hostname}>
      {children}
    </RequestHostnameContext.Provider>
  );
}

export function useRequestHostname() {
  return useContext(RequestHostnameContext);
}
