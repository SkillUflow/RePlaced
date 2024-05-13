import React,{useState, useEffect, act} from 'react';
import { Text,View,StyleSheet,Pressable,Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {AppLoading} from "expo"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useGlobalContext } from '../components/GlobalContext';

import closeImg from "../assets/buttons/close.png"
import lineLogo from "../assets/lineLogo.png"



import Welcome1 from './welcome1';
import Welcome2 from './welcome2';
import Welcome3 from './welcome3';










const WelcomeScreen = ({navigation}) => {

  const { sessionKey, setSessionKey, setConnModalVisible, serverURL } = useGlobalContext();

  const Tab = createMaterialTopTabNavigator();

  
  async function tryLogin() {

    if(!sessionKey) {
      navigation.navigate("MainMap");
      setConnModalVisible(true);
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
      if(resultat.response) {
        navigation.navigate("MainMap");
        setConnModalVisible(false);
      }
      // Else, open login menu
      else {
        navigation.navigate("MainMap");
        setConnModalVisible(true);
      }
    }
  }
  
  return (
    <View style={styles.container}>
              <Pressable style={styles.closeBtn}  onPress={() => {navigation.navigate("MainMap")}}>
                <Image source={closeImg} style={styles.closeImg}/>
              </Pressable>
              <Image source={lineLogo} style={styles.LogoImage}/>
              <Tab.Navigator
                  style={{width:"100%"}}
                  initialRouteName="Welcome1"
                  screenOptions={{
                    swipeEnabled: true, // Active le swipe entre les tabs ici
                    tabBarStyle: { display: "none" } // Cache la barre de navigation des tabs
                  }} 
              >    
                <Tab.Screen name="Welcome1" component={Welcome1}/>
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
    paddingBottom:40,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor:"#1C62CA",
    
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
  mainImage: {
    height: "30%",
    resizeMode: "contain",
  },
  text: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontFamily: "KronaOne"
  },
  centerText: {
    width: "80%"
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
  

  circleContainer: {
    flexDirection: 'row',
    width: '30%',
    alignItems: 'center',
    height: 80,
    marginBottom: 30,
    justifyContent: 'space-between'
  },

  smallBtnContainer: {
    width: '20%',
    height: '20%',
  },

  bigBtnContainer: {
    width: '35%',
    height: '35%',
  },

  circle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  }
});
  
export default WelcomeScreen;
