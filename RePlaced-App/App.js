import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

import MapView from 'react-native-maps';


const position = [51.505, -0.09]

export default function App() {

  return (
  
    <View style={styles.container}>
      <Text>Il n'y a plus qu'à !</Text>


      <MapView
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
        }}
      />

    <Text>Pas mal, non ?</Text>


      
    <StatusBar style="auto" />
          

    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
