import { Text, View, StyleSheet, Pressable, Image, StatusBar } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import { useGlobalContext } from '../components/GlobalContext';

// Images
let closeImg = "https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/close.png?v=1715939489965"
let lineLogo = "https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/lineLogo.png?v=1715939587722"

// Slides
import Welcome1 from './welcome1';
import Welcome2 from './welcome2';
import Welcome3 from './welcome3';
import { getItem, setItem } from '../utils/storageManager';



const WelcomeScreen = ({ navigation }) => {

  const { sessionKey, setConnModalVisible, serverURL, setConnMenu, isNightMode, setSessionKey } = useGlobalContext();
  const Tab = createMaterialTopTabNavigator();

  // Set the status bar in white
  StatusBar.setBarStyle('light-content');

  const displayOnboarding = async () => {
    setSessionKey(await getItem("sessionKey")); 

    let response = await getItem("alreadyOpened");
    
    if(response) {
      navigation.navigate("MainMap")
    }

    else {
      await setItem("alreadyOpened", true);
    }

  }

  displayOnboarding();

  const onClose = () => {
    navigation.navigate("MainMap");

    // Status bar style
    StatusBar.setBarStyle(isNightMode ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }


  async function tryLogin() {

    if (!sessionKey) { //if the user is not loged
      navigation.navigate("MainMap");
      setConnModalVisible(true);
      setConnMenu('login');
    }

    else {  //Chek if his sessionKey is valid
      const response = await fetch(serverURL + "/isLogged", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionKey
        })
      });

      const resultat = await response.json();

      // Is user is logged in, immediately go to map
      if (resultat.response) {
        navigation.navigate("MainMap");
        setConnModalVisible(false);
      }
      // Else, open login menu
      else {
        navigation.navigate("MainMap");
        setConnModalVisible(true);
        setConnMenu('login');
      }
    }
  }

  

  return (
    <View style={styles.container}>
      
      <><Pressable style={styles.closeBtn} onPress={ onClose }>
        <Image src={closeImg} style={styles.closeImg} />
      </Pressable>
      <Image src={lineLogo} style={styles.LogoImage} /></>
      <>
      <Tab.Navigator
        style={styles.navigator}
        initialRouteName="Welcome1"
        screenOptions={{
          swipeEnabled: true, // Activate swipe between tabs
          tabBarStyle: { display: "none" } // Hide navigation bar of the tabs
        }}
      >
        <Tab.Screen style={styles.screen} name="Welcome1" component={Welcome1} />
        <Tab.Screen name="Welcome2" component={Welcome2} />
        <Tab.Screen name="Welcome3" component={Welcome3} />
      </Tab.Navigator>

      </>
      <Pressable style={styles.CTA} onPress={tryLogin}>
        <Text style={styles.text}>Me connecter</Text>
      </Pressable>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#1C62CA",
  },

  navigator : {
    width: '100%'
  },

  closeBtn: {
    position: "absolute",
    right: 20,
    top: 40,
    height: 30,
    width: 30,
    zIndex: 10
  },
  closeImg: {
    height: '100%',
    width: '100%'
  },
  
  text: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontFamily: "KronaOne"
  },
  CTA: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 8
  },

  LogoImage: {
    width: '80%',
    height: '10%',
    marginTop: 30,
    resizeMode: 'contain'
  },


});

export default WelcomeScreen;
