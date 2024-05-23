import { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export const ContextProvider = ({ children }) => {

  const [sessionKey, setSessionKey]             = useState(false);
  const [connModalVisible, setConnModalVisible] = useState(false);
  const [connMenu, setConnMenu]                 = useState('login');
  const [serverURL, setServerURL]               = useState('http://192.168.10.43:3000');
  const [settingsOpened, setSettingsOpen]       = useState(false);
  const [alertOpened, setAlertOpened]           = useState(false);
  const [alertMessage, setAlertMessage]         = useState({type: 'warning', message: 'Hello World'});
  const [currentScreen, setCurrentScreen]       = useState(0);
  const [isNightMode, setIsNightMode]           = useState(false);


  const isLogged = async () => {

    // If user has no session key, unlog him
    if(!sessionKey) return {
      logged: false,
      surname: ''
    }

    // Asking server for connection or not
    const response = await fetch(serverURL + '/isLogged', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionKey })
    })

    const result = await response.json();

    if(!result.response) {
      setSessionKey(false);

      return {
        logged: false,
        surname: ''
      }
    }

    return {
      logged: true,
      surname: result.surname
    }
  }


  const getPinList = async () => {
    const response = await fetch(serverURL + "/pinList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey
      }),
    });

    const resultat = await response.json();

    return resultat.db;
  }


  const logout = async () => {

    const response = await fetch(serverURL + "/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey
      }),
    });

    return await response.json();
  }


  const logIn = async (email, password) => {
    // Request to server to ask for login
    const response = await fetch(serverURL + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password
      }),
    });

    return await response.json();;
  }


  const accountDelete = async () => {

    const response = await fetch(serverURL + "/deleteAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey
      }),
    });

    return await response.json();
  }


  const signUp = async () => {
    const response = await fetch(serverURL + "/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        surname,
        email,
        password: hashPassword(password)
      }),
    });

    return await response.json();
  }


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
      isNightMode,      setIsNightMode,


      isLogged,
      getPinList,
      logout,
      logIn,
      accountDelete,
      signUp
    }}>
      {children}
    </GlobalContext.Provider>
  );


};
