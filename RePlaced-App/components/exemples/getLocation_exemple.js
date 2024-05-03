import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { getLocation } from './components/getLocation'

let uCoords = []; 

export default function App() {

  return (
  
    <View style={styles.container}>
      <Text>Click to get user position ! {Math.floor(Math.random() * 10) + 1}</Text>

      <Button
        onPress={

          // Fonction asynchrone
          async () => {
          try {
            const location = await getLocation();
            const locationData = JSON.parse(location);

            uCoords[0] = locationData["coords"]["longitude"];
            uCoords[1] = locationData["coords"]["latitude"];

            alert(uCoords);

          } catch (error) {
            console.error(error);
            alert("Une erreur est survenue");
          }
          
        }}
        title="Here !"
      />

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
