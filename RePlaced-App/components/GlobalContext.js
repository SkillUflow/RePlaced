import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export const ContextProvider = ({ children }) => {

  const [sessionKey, setSessionKey]             = useState(false);
  const [connModalVisible, setConnModalVisible] = useState(false);
  const [connMenu, setConnMenu]                 = useState('login');
  const [serverURL, setServerURL]               = useState('http://192.168.56.1:3000');
  const [settingsOpened, setSettingsOpen]        = useState(false);
  const [alertOpened, setAlertOpened]           = useState(true);
  const [alertMessage, setAlertMessage]         = useState({type: 'warning', message: 'Hello World'});

  return (
    <GlobalContext.Provider value={{ 
      sessionKey,       setSessionKey, 
      connModalVisible, setConnModalVisible, 
      connMenu,         setConnMenu,
      serverURL,        setServerURL,
      settingsOpened,    setSettingsOpen,
      alertOpened,      setAlertOpened,
      alertMessage,     setAlertMessage
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
