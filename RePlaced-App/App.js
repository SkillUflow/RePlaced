import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { getLocation } from './components/getLocation'

let uCoords = []; 

export default function App() {

  return (
  
    <View style={styles.container}>
      <Text>Il n'y a plus qu'à</Text>

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
