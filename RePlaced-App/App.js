import React, { useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ContextProvider } from './components/GlobalContext';
import MainMap from './pages/mainMap';
import WelcomeScreen from './pages/onboarding';
import * as Font from 'expo-font';
import AlertPopup from './components/AlertPopup';



const kronaOne = {
  'KronaOne': require('./assets/fonts/KronaOne-Regular.ttf'),
};


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





const Stack = createNativeStackNavigator();

const App = () => {

  const [fontsLoaded] = Font.useFonts(kronaOne);

  if(!fontsLoaded) {
    return null
  }
  else {

    return (
      <ContextProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="WelcomeScreen" 
              component={WelcomeScreen} />
            <Stack.Screen 
              name="MainMap" 
              component={MainMap} 
              initialParams={{ userCoords, pinList}} />
          </Stack.Navigator>
        </NavigationContainer>

        <AlertPopup />

      </ContextProvider>
    );
}
}

export default App;
