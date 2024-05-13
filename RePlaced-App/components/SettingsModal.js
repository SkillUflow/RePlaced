import React, { useState, useEffect } from "react";
import { Modal, Text, View, Pressable, StyleSheet, StatusBar, Image, TextInput, Switch } from "react-native";
import { useGlobalContext } from './GlobalContext';
import closeImg from "../assets/buttons/close.png"
import * as Font from 'expo-font';


const SettingsModal = () => {

  const { settingsOpened, setAlertOpened, setAlertMessage, alertMessage, setSessionKey, setSettingsOpen, sessionKey, serverURL, setConnMenu, setConnModalVisible } = useGlobalContext();

  const [surname, setSurname] = useState('');
  const [connected, setConnected] = useState(false);

  const closeModal = () => {
    setSettingsOpen(false)
    StatusBar.hidden = false;
  }

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

  const disconnect = () => {
    setAlertMessage({ type: 'success', message: "Vous êtes bien déconnecté(e)" });
    setAlertOpened(true)
    setSessionKey(false);
    setSettingsOpen(false)
    setConnected(false)
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

  // If logged in
  if (connected) {

    return (
      <Modal
        animationType="slide"
        visible={settingsOpened}
        onRequestClose={() => {
          closeModal();
        }}
      >

        <View style={styles.modalView} onStartShouldSetResponder={() => true}>

          <Pressable style={styles.closeBtn} onPress={() => setSettingsOpen(false)}>
            <Image source={require('../assets/buttons/close.png')} style={styles.closeImg}></Image>
          </Pressable>

          <View style={styles.container}>
            <View style={styles.mainBox}>
              <Text style={styles.title}>Paramètres</Text>
              <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Bonjour {surname}</Text>
                <Pressable style={styles.btn} onPress={() => disconnect()}>
                  <Text style={styles.btnText}>Déconnexion</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => deleteAccount()}>
                  <Text style={styles.btnText}>Supprimer le compte</Text>
                </Pressable>
              </View>
            </View>
            <Image style={styles.bottomLogo} source={require('../assets/lineLogo.png')}></Image>
          </View>

        </View>

      </Modal>
    )
  }

  else {

    return (
      <Modal
        animationType="slide"
        visible={settingsOpened}
        onRequestClose={() => {
          closeModal();
        }}
      >

        <View style={styles.modalView} onStartShouldSetResponder={() => true}>

          <Pressable style={styles.closeBtn} onPress={() => setSettingsOpen(false)}>
            <Image source={require('../assets/buttons/close.png')} style={styles.closeImg}></Image>
          </Pressable>

          <View style={styles.container}>
            <View style={styles.mainBox}>
              <Text style={styles.title}>Paramètres</Text>

              <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Déconnecté(e)</Text>
                <Pressable style={styles.btn} onPress={() => { setSettingsOpen(false); setConnModalVisible(true); setConnMenu('login') }}>
                  <Text style={styles.btnText}>Se connecter</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => { setSettingsOpen(false); setConnModalVisible(true); setConnMenu('signup') }}>
                  <Text style={styles.btnText}>S'inscrire</Text>
                </Pressable>
              </View>

              <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Tutoriel</Text>
                <Pressable style={styles.btn} onPress={() => { setSettingsOpen(false); setConnModalVisible(true); setConnMenu('login') }}>
                  <Text style={styles.btnText}>Retour au onboarding</Text>
                </Pressable>
              </View>

              <View style={styles.contentBox}>
                <Text style={styles.subTitle}>Mode clair/sombre</Text>
                <Switch></Switch>
              </View>
            </View>
          </View>
        </View>

      </Modal>
    )
  }
}
const styles = StyleSheet.create({
  modalView: {
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
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
  }


});


export default SettingsModal;