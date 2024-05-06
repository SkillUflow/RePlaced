import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import { getLocation } from './components/getLocation';

// Graphic assets
import colorPin1 from "./assets/map/color_pin1.png"

let userCoords = [0.65, 45.9167]; // Longitude et latitude par défaut

const App = () => {

  const [mapRegion, setMapRegion] = useState({
    latitude: userCoords[1],
    longitude: userCoords[0],
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await getLocation();
        const locationData = JSON.parse(location);

        userCoords[0] = locationData.coords.longitude;
        userCoords[1] = locationData.coords.latitude;

        setMapRegion(prevRegion => ({
          ...prevRegion,
          latitude: userCoords[1],
          longitude: userCoords[0],
        }));

      } catch (error) {
        console.error(error);
        alert("Une erreur est survenue lors de la récupération de la position. Veuillez relancer l'application RePlaced ;)");
      }
    };

    // Actualiser la position toutes les 2 secondes
    const intervalId = setInterval(getUserLocation, 2000);
    return () => clearInterval(intervalId);

  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <MapView
        style={styles.map}
        region={mapRegion}
      >
       <Marker coordinate={{ latitude: userCoords[1], longitude: userCoords[0] }}>
          <Image source={colorPin1} style={{ width: 35, height: 60 }} />
        </Marker>

      </MapView>
    
      <Pressable onPress={() => console.log("Centrons la carte à présent :)")} style={styles.center_btn}>
        <Image source={require("./assets/buttons/center_map.png")} style={styles.center_btn_img}/>
      </Pressable>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#505005',
    justifyContent: 'center',
  },
  map: {
    flex:1,
  },

  center_btn:{
    width:10,
    position: 'absolute',
    bottom: 20,
    left: 20,
  },

  center_btn_img:{
    height:80,
    width:80,
  }
});

export default App;
