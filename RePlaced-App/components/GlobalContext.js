import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export const ContextProvider = ({ children }) => {

  const [sessionKey, setSessionKey]             = useState(false);
  const [connModalVisible, setConnModalVisible] = useState(false);
  const [connMenu, setConnMenu]                 = useState('login');
  const [serverURL, setServerURL]               = useState('http://192.168.1.13:3000');

  return (
    <GlobalContext.Provider value={{ 
      sessionKey, setSessionKey, 
      connModalVisible, setConnModalVisible, 
      connMenu, setConnMenu,
      serverURL, setServerURL
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
