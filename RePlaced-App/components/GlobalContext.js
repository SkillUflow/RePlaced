import { createContext, useState, useContext } from 'react';
import { getItem, setItem } from '../utils/storageManager';

// pass data down the component tree without having to manually pass props at every level
const GlobalContext = createContext();

// Provides access to the GlobalContext value
export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

// Contains all global variables
export const ContextProvider = ({ children }) => {

  const [sessionKey, setSessionKey]             = useState(false);
  const [connModalVisible, setConnModalVisible] = useState(false);
  const [connMenu, setConnMenu]                 = useState('login');
  const [serverURL, setServerURL]               = useState('http://51.75.142.229:3001');
  const [settingsOpened, setSettingsOpen]       = useState(false);
  const [alertOpened, setAlertOpened]           = useState(false);
  const [alertMessage, setAlertMessage]         = useState({type: 'warning', message: 'Hello World'});
  const [currentScreen, setCurrentScreen]       = useState(0);
  const [isNightMode, setIsNightMode]           = useState(false);

  // GLobal function to check if user is logged in
  const isLogged = async () => {
  
    setItem("alreadyOpened", true);

    let sessionKey = await getItem("sessionKey");

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

    // If no/wrong answer, disconnect user
    if(!result.response) {
      setItem("sessionKey", false);
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

  // Gets pins from the database
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

  // Global function to logout a user
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


  // Global function to log in a user
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


  // Global function to delete an account
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


  // Global function to sign up a user
  const signUp = async (email, surname, password) => {
    const response = await fetch(serverURL + "/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        surname,
        email,
        password
      }),
    });

    return await response.json();
  }


  // Sending the global context
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
