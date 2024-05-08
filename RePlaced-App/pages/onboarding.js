import React,{useState} from 'react';
import { Text } from 'react-native';
import {AppLoading} from "expo"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


import closeImg from "../assets/buttons/close.png"
import lineLogo from "../assets/lineLogo.png"
import imageOne from "../assets/onboarding/imageOne.png"


import Welcome1 from './welcome1';
import Welcome2 from './welcome2';
import Welcome3 from './welcome3';



  
const Tab = createMaterialTopTabNavigator();
  
const  WelcomeScreen = ()=> {
  
  return (
    <Tab.Navigator
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
  );
}


export default WelcomeScreen;
