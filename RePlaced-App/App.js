import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import { getLocation } from './components/getLocation';
import Modale from './components/modale';

let userCoords = [0.65, 45.9167]; // Longitude et latitude par défaut

const App = () => {

  const [modalVisible, setModalVisible] = useState(false);
  var [CoordinateMarker,setCoordinateMarker]=useState({lat:0.65,long:45.9167})
  const [mapRegion, setMapRegion] = useState({
    latitude: userCoords[1],
    longitude: userCoords[0],
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  const openModal = (coordinate)=>{
    setCoordinateMarker(coordinate)
    setModalVisible(!modalVisible);
    StatusBar.hidden=true;
  }

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
    // const intervalId = setInterval(getUserLocation, 2000);
    // return () => clearInterval(intervalId);
    getUserLocation();

  }, []);

  return (
    <View style={styles.container}>

      
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
        <Marker
            key={3}
            coordinate={{ latitude:50.629850 , longitude:3.066374  }}
            onPress={() => openModal({ lat:50.629850 , long:3.066374  })}
          />

        <Marker
            key={4}
            coordinate={{ latitude:0 , longitude:0  }}
            onPress={() => openModal({ lat:0 , long:0  })}
          />
      </MapView>
    
      <Pressable onPress={() => console.log("Centrons la carte à présent :)")} style={styles.center_btn}>
        <Image source={require("./assets/buttons/center_map.png")} style={styles.center_btn_img}/>
      </Pressable>

      <Modale modalVisible={modalVisible} setModalVisible={setModalVisible} coordonnes={CoordinateMarker}></Modale>
      <StatusBar hidden={modalVisible} />
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
