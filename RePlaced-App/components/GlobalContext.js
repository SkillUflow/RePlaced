import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export const ContextProvider = ({ children }) => {

  const [sessionKey, setSessionKey]             = useState(false);
  const [connModalVisible, setConnModalVisible] = useState(false);
  const [connMenu, setConnMenu]                 = useState('login');
  const [serverURL, setServerURL]               = useState('http://192.168.1.57:3000');
  const [settinsOpened, setSettingsOpen]        = useState(false);
  const [alertOpened, setAlertOpened]           = useState(false);
  const [alertMessage, setAlertMessage]         = useState({type: 'warning', message: 'Hello World'});

  return (
    <GlobalContext.Provider value={{ 
      sessionKey,       setSessionKey, 
      connModalVisible, setConnModalVisible, 
      connMenu,         setConnMenu,
      serverURL,        setServerURL,
      settinsOpened,    setSettingsOpen,
      alertOpened,      setAlertOpened,
      alertMessage,     setAlertMessage
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
