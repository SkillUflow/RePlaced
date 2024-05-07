import React, { useEffect, useState, useRef } from 'react';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable, Image, Text, Button} from 'react-native';
import { getLocation } from './components/getLocation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';



import HomeScreen from './pages/homeScreen';
import MainMap from './pages/mainMap';

let userCoords = [0.65, 45.9167]; // Longitude et latitude par défaut

let pinList = {
  0: {
    lat:50.63003046513421,
    long: 3.0577013159390477
  },
  1: {
    lat:50.63103046513421,
    long: 3.0587013159390477
  },
  2: {
    lat:50.63203046513421,
    long: 3.0597013159390477
  },
  3: {
    lat:50.63303046513421,
    long: 3.0607013159390477
  },
  4: {
    lat:50.63403046513421,
    long: 3.0617013159390477
  }
}


/*En attente de pouvoir les bouger ailleurs*/

const Welcome1 = ({navigation}) =>{
  return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Ecran d'accueil 1</Text>
          <Button title="X" onPress={() => {navigation.navigate("MainMap")}}></Button>
      </View>
  );
}

const Welcome2 = ({navigation}) =>{
  return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Ecran d'accueil 2</Text>
      </View>
  );
}

const Welcome3 = ({navigation}) =>{
  return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Ecran d'accueil 3</Text>
      </View>
  );
}

const Tab = createMaterialTopTabNavigator();

function WelcomeScreen() {
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


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={(props) => (<HomeScreen {...props} />)} />
        <Stack.Screen name="MainMap" component={() => (<MainMap userCoords={userCoords} pinList={pinList} />)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
