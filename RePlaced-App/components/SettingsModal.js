import React, { useState, useEffect } from "react";
import { Modal, Text, View, Pressable, StyleSheet, Image, Switch, StatusBar } from "react-native";
import { useGlobalContext } from './GlobalContext';

const SettingsModal = ({navigation}) => {
  
  const { settingsOpened, setAlertOpened, setAlertMessage, alertMessage, setSessionKey, setSettingsOpen, sessionKey, serverURL, setConnMenu, setConnModalVisible, isNightMode, setIsNightMode } = useGlobalContext();
  const [surname, setSurname] = useState('');
  const [connected, setConnected] = useState(false);


  const closeModal = () => {
    setSettingsOpen(false)
  }

  const toggleSwitch = (invert) => {
    setIsNightMode(!isNightMode);  // Modifier l'état global
    styles = !isNightMode ? styleNight : styleDay;
  };

  const deleteAccount = async () => {
    const response = await fetch(serverURL + "/deleteAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey
      }),
    });

    const resultat = await response.json();

    if (!resultat.response) {
      setAlertMessage({ type: 'error', message: "Une erreur est survenue. Vous n'étiez peut-être pas/plus connecté(e) ? Réessayez plus tard" });
      setAlertOpened(true)

    }
    else {
      setConnected(false)
      setSessionKey(false);
      setSettingsOpen(false);
      setAlertMessage({ type: 'success', message: "Votre compte a bien été supprimé" });
      setAlertOpened(true)
    }

  }

  const disconnect = async () => {

    const response = await fetch(serverURL + "/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey
      }),
    });

    const resultat = await response.json();

    if (!resultat.response) {
      setAlertMessage({ type: 'error', message: "Une erreur est survenue. Vous n'étiez peut-être pas/plus connecté(e) ? Réessayez plus tard" });
      setAlertOpened(true);
    }
    else {
      setAlertMessage({ type: 'success', message: "Vous êtes bien déconnecté(e)" });
      setAlertOpened(true)
      setSessionKey(false);
      setSettingsOpen(false)
      setConnected(false)
    }
  }

  useEffect(() => {
    const isLogged = async () => {
      const response = await fetch(serverURL + "/isLogged", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionKey
        }),
      });

      const resultat = await response.json();

      setConnected(resultat.response);
      setSurname(resultat.surname);
    }

    isLogged();
  }, [serverURL, sessionKey]);

  return (
    
    <Modal
      animationType="slide"
      visible={settingsOpened}
      onRequestClose={() => closeModal()}
    >

        <View style={styles.modalView} onStartShouldSetResponder={() => true}>

          <Pressable style={styles.closeBtn} onPress={() => closeModal()}>
            <Image source={require('../assets/buttons/close.png')} style={styles.closeImg}></Image>
          </Pressable>

          <View style={styles.container}>
            <View style={styles.mainBox}>
              <Text style={styles.title}>Paramètres</Text>

              {connected ? (

              <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Bonjour {surname}</Text>
                <Pressable style={styles.btn} onPress={() => disconnect()}>
                  <Text style={styles.btnText}>Déconnexion</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => deleteAccount()}>
                  <Text style={styles.btnText}>Supprimer le compte</Text>
                </Pressable>
              </View>

              ) : (
              <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Déconnecté(e)</Text>
                <Pressable style={styles.btn} onPress={() => { setSettingsOpen(false); setConnModalVisible(true); setConnMenu('login') }}>
                  <Text style={styles.btnText}>Se connecter</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => { setSettingsOpen(false); setConnModalVisible(true); setConnMenu('signup') }}>
                  <Text style={styles.btnText}>S'inscrire</Text>
                </Pressable>
              </View>
              )
            }
            </View>

            <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Tutoriel</Text>
                <Pressable style={styles.btn} onPress={() => { setSettingsOpen(false); navigation.navigate('WelcomeScreen') }}>
                  <Text style={styles.btnText}>Retour au onboarding</Text>
                </Pressable>
              </View>

              <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Mode clair/sombre</Text>
                <Switch
                  value={isNightMode}
                  onValueChange={toggleSwitch}
                />
              </View>
          </View>

          <StatusBar backgroundColor={!isNightMode ? "#1C62CA" : "#092145"} />

        </View>

      </Modal>
  )

}

const styleDay = StyleSheet.create({
  modalView: {
    justifyContent: 'flex-start',
    height: '100%',
    width: "100%",
    marginTop: 0,
    backgroundColor: '#1C62CA',
    padding: 35,

  },
  container: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    paddingTop: 10,
    justifyContent: 'flex-start',
  },

  title: {
    fontFamily: "Kanit",
    fontSize: 60,
    color: 'white',
    textAlign: 'center',
    width: '100%'
  },

  closeBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    height: 30,
    width: 30,
  },
  closeImg: {
    height: "100%",
    width: "100%",
    resizeMode: 'contain',
  },

  bottomLogo: {
    maxWidth: '100%',
    height: 100,
    resizeMode: 'contain'
  },

  mainBox: {
    width: '100%'
  },

  contentBox: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center'
  },

  subTitle: {
    fontSize: 30,
    fontFamily: "Kanit",
    color: '#1C62CA'
  },

  btn: {
    width: '90%',
    backgroundColor: '#1C62CA',
    color: 'white',
    padding: 10,
    borderRadius: 15,
    marginTop: 10
  },

  btnText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontFamily: "Kanit-light",
  },

  themeSwitch:{
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]
  }

});

const styleNight = StyleSheet.create({
  modalView: {
    justifyContent: 'flex-start',
    height: '100%',
    width: "100%",
    marginTop: 0,
    backgroundColor: '#092145',
    padding: 35,

  },
  container: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    paddingTop: 10,
    justifyContent: 'flex-start',
  },

  title: {
    fontFamily: "Kanit",
    fontSize: 60,
    color: 'white',
    textAlign: 'center',
    width: '100%'
  },

  closeBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    height: 30,
    width: 30,
  },
  closeImg: {
    height: "100%",
    width: "100%",
    resizeMode: 'contain',
  },

  bottomLogo: {
    maxWidth: '100%',
    height: 100,
    resizeMode: 'contain'
  },

  mainBox: {
    width: '100%'
  },

  contentBox: {
    width: '100%',
    backgroundColor: '#1C62CA',
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center'
  },

  subTitle: {
    fontSize: 30,
    fontFamily: "Kanit",
    color: 'white'
  },

  btn: {
    width: '90%',
    backgroundColor: '#092145',
    color: '#1C62CA',
    padding: 10,
    borderRadius: 15,
    marginTop: 10
  },

  btnText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontFamily: "Kanit-light",
  },

  themeSwitch:{
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]
  }

});

let styles = styleDay;


export default SettingsModal;