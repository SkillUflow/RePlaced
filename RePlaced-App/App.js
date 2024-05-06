import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { getLocation } from './components/getLocation';

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

        console.log("Position actuelle :");
        console.log("\t LONGITUDE :", userCoords[0]);
        console.log("\t  LATITUDE : ", userCoords[1]);
        console.log("\n");

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
        onRegionChangeComplete={region => setMapRegion(region)}
      >
        <Marker
          coordinate={{ latitude: userCoords[1], longitude: userCoords[0] }}
          title="Votre position"
          description="Vous êtes ici"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});

export default App;
