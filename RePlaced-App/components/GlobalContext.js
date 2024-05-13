import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export const ContextProvider = ({ children }) => {

  const [sessionKey, setSessionKey]             = useState(false);
  const [connModalVisible, setConnModalVisible] = useState(false);
  const [connMenu, setConnMenu]                 = useState('login');
  const [serverURL, setServerURL]               = useState('http://192.168.51.43:3000');
  const [settingsOpened, setSettingsOpen]       = useState(false);
  const [alertOpened, setAlertOpened]           = useState(false);
  const [alertMessage, setAlertMessage]         = useState({type: 'warning', message: 'Hello World'});
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isNightMode, setIsNightMode] = useState(false);

  return (
    <GlobalContext.Provider value={{ 
      sessionKey,       setSessionKey, 
      connModalVisible, setConnModalVisible, 
      connMenu,         setConnMenu,
      serverURL,        setServerURL,
      settingsOpened,   setSettingsOpen,
      alertOpened,      setAlertOpened,
      alertMessage,     setAlertMessage,
      currentScreen,    setCurrentScreen,
      isNightMode,      setIsNightMode
    }}>
      {children}
    </GlobalContext.Provider>
  );


};
