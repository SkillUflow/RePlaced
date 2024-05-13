import React, { useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ContextProvider } from './components/GlobalContext';
import MainMap from './pages/mainMap';
import WelcomeScreen from './pages/onboarding';
import * as Font from 'expo-font';
import AlertPopup from './components/AlertPopup';



const fonts = {
  'KronaOne': require('./assets/fonts/KronaOne-Regular.ttf'),
  'Kanit': require('./assets/fonts/Kanit-Regular.ttf'),
  'Kanit-thin': require('./assets/fonts/Kanit-Thin.ttf'),
  'Kanit-light': require('./assets/fonts/Kanit-Light.ttf'),
};


let userCoords = [0.65, 45.9167]; // Longitude et latitude par défaut

let pinList = {}





const Stack = createNativeStackNavigator();

const App = () => {

  const [fontsLoaded] = Font.useFonts(fonts);

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
