import { useState } from "react";
import { Modal, Text, View, Pressable, StyleSheet, Image, Switch, StatusBar, Linking } from "react-native";
import { useGlobalContext } from './GlobalContext';

const SettingsModal = ({navigation}) => {
  
  const { settingsOpened, setAlertOpened, setAlertMessage, setSessionKey, setSettingsOpen, accountDelete, serverURL, setConnMenu, setConnModalVisible, isNightMode, setIsNightMode, isLogged, logout } = useGlobalContext();
  const [surname, setSurname] = useState('');
  const [connected, setConnected] = useState(false);


  const closeModal = () => {
    // Status bar style
    StatusBar.setBarStyle(isNightMode ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);

    // Closing tab
    setSettingsOpen(false);
  }

  const modalOpened = async () => {
    // Manages login
    let logInfo = await isLogged();

    setConnected(logInfo.logged);
    setSurname(logInfo.surname);

    // Status bar style
    StatusBar.setBarStyle(isNightMode ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(isNightMode ? '#092145' : '#1C62CA');
    StatusBar.setTranslucent(false);

    // Update styles
    styles = isNightMode ? styleNight : styleDay;
  };

  const toggleSwitch = () => {
    let nightMode = !isNightMode;

    // Update style
    styles = nightMode ? styleNight : styleDay;

    // Status bar style
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor(nightMode ? '#092145' : '#1C62CA');
    StatusBar.setTranslucent(false);

    // Modifier l'état global
    setIsNightMode(nightMode);
  };

  const deleteAccount = async () => {

    const resultat = await accountDelete();

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

    const resultat = await logout();

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


  return (
    
    <Modal
      animationType="slide"
      visible={settingsOpened}
      onRequestClose={() => closeModal()}
      onShow={() => modalOpened()}
    >

        <View style={styles.modalView} onStartShouldSetResponder={() => true}>

          <Pressable style={styles.closeBtn} onPress={() => closeModal()}>
            <Image src={"https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/close.png?v=1715939489965"} style={styles.closeImg}></Image>
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

              <Pressable style={styles.btn} onPress={() => {Linking.openURL('http://51.75.142.229:3001/')}}>
                <Text style={styles.openSite}>Site web</Text>
              </Pressable>

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
  },

  openSite:{
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontFamily: "Kanit-light",
    paddingTop:20,
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
  },

  openSite:{
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontFamily: "Kanit-light",
    paddingTop:20,
  }

});

let styles = styleDay;


export default SettingsModal;