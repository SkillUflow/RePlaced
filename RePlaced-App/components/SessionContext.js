import React, { createContext, useState, useContext } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const [sessionKey, setSessionKey] = useState(false);

  return (
    <SessionContext.Provider value={{ sessionKey, setSessionKey }}>
      {children}
    </SessionContext.Provider>
  );
};
