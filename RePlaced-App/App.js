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
  'KronaOne': 'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/KronaOne-Regular.ttf?v=1715938949087',
  'Kanit': 'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/Kanit-Regular.ttf?v=1715938974131',
  'Kanit-thin': 'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/Kanit-Thin.ttf?v=1715938994406',
  'Kanit-light': 'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/Kanit-Light.ttf?v=1715939007410'
};


const App = () => {

  const [fontsLoaded] = Font.useFonts(fonts);
  const Stack = createNativeStackNavigator();


  if (!fontsLoaded) {
    return <Image style={{ backgroundColor: '#1C62CA', height: '100%', width: '100%', resizeMode: 'fit' }} src={'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/splash.png?v=1715940872492'}></Image>
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
