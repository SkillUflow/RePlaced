import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';

// Components
import { ContextProvider } from './components/GlobalContext';
import AlertPopup from './components/AlertPopup';

// Pages
import MainMap from './pages/mainMap';
import WelcomeScreen from './pages/onboarding';

const fonts = {
  'KronaOne': require('./assets/fonts/KronaOne-Regular.ttf'),
  'Kanit': require('./assets/fonts/Kanit-Regular.ttf'),
  'Kanit-thin': require('./assets/fonts/Kanit-Thin.ttf'),
  'Kanit-light': require('./assets/fonts/Kanit-Light.ttf')
};


const App = () => {

  const [fontsLoaded] = Font.useFonts(fonts);
  const Stack = createNativeStackNavigator();


  if (!fontsLoaded) {
    return <Image style={{ backgroundColor: '#1C62CA', height: '100%', width: '100%', resizeMode: 'fit' }} source={require('./assets/splash.png')}></Image>
  } else {



    return (
      <ContextProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="WelcomeScreen"
              component={WelcomeScreen} />
            <Stack.Screen
              name="MainMap"
              component={MainMap} />
          </Stack.Navigator>
        </NavigationContainer>

        <AlertPopup />

      </ContextProvider>
    );
  }
}

export default App;
