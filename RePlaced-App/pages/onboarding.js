import { Text, View, StyleSheet, Pressable, Image, StatusBar } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useEffect, useRef } from 'react';

// Components
import { useGlobalContext } from '../components/GlobalContext';

// Images
import closeImg from "../assets/buttons/close.png"
import lineLogo from "../assets/lineLogo.png"

// Slides
import Welcome1 from './welcome1';
import Welcome2 from './welcome2';
import Welcome3 from './welcome3';


const WelcomeScreen = ({ navigation }) => {

  const { sessionKey, setConnModalVisible, serverURL, setConnMenu } = useGlobalContext();
  const Tab = createMaterialTopTabNavigator();

  // Set the status bar in white
  // StatusBar.setBarStyle('light-content');

  // console.log(navigation.getState().routes[0].state.index)



  async function tryLogin() {

    if (!sessionKey) {
      navigation.navigate("MainMap");
      setConnModalVisible(true);
      setConnMenu('login');
    }

    else {
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

  // <StatusBar backgroundColor="#1C62CA"></StatusBar>

  return (
    <View style={styles.container}>
      
      <Pressable style={styles.closeBtn} onPress={() => { navigation.navigate("MainMap") }}>
        <Image source={closeImg} style={styles.closeImg} />
      </Pressable>
      <Image source={lineLogo} style={styles.LogoImage} />
      <Tab.Navigator
        style={{ width: "100%" }}
        initialRouteName="Welcome1"
        screenOptions={{
          swipeEnabled: true, // Active le swipe entre les tabs ici
          tabBarStyle: { display: "none" } // Cache la barre de navigation des tabs
        }}
      >
        <Tab.Screen name="Welcome1" component={Welcome1} />
        <Tab.Screen name="Welcome2" component={Welcome2} />
        <Tab.Screen name="Welcome3" component={Welcome3} />
      </Tab.Navigator>

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

  closeBtn: {
    position: "absolute",
    right: 20,
    top: 50,
    height: 30,
    width: 30,
  },
  closeImg: {
    height: "100%",
    width: "100%",
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
    resizeMode: 'contain'
  },


});

export default WelcomeScreen;
