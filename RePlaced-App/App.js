import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Pressable, Image, StatusBar } from 'react-native';
import { getLocation } from './components/getLocation';
import PinModale from './components/pinModale';
import LogSignModale from './components/LogSignModale';

// Graphic assets
import colorPin1 from "./assets/map/color_pin1.png"

let userCoords = [0.65, 45.9167]; // Longitude et latitude par défaut

let pinList = {
  0: {
    lat:1,
    long:1
  },
  1: {
    lat:1.1,
    long:1.1
  },
  2: {
    lat: 1.2,
    long: 1.2
  },
  3: {
    lat: 1.3,
    long: 1.3
  },
  4: {
    lat: 1.4,
    long: 1.4
  }
}

const App = () => {

  const [modalVisible, setModalVisible] = useState(false);
  var [CoordinateMarker,setCoordinateMarker]=useState({lat:0.65,long:45.9167})

  const [mapRegion, setMapRegion] = useState({
    latitude: userCoords[1],
    longitude: userCoords[0],
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  const mapRef = useRef(null);


  

  const openModal = (coordinate)=>{
    setCoordinateMarker(coordinate)
    setPinModalVisible(!pinModalVisible);
    StatusBar.setHidden(true);
  }

  const openLogModal = () => {
    setLogModalVisible(!logModalVisible);
    StatusBar.setHidden(true);
  }

  const centerMap = ()=>{
    mapRef.current.animateToRegion({
      latitude:userCoords[1],
      longitude: userCoords[0],
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    },500)
  }

  useEffect(() => {
    let firstTime = true;
    const getUserLocation = async (firstTime=false) => {
      try {
        const location = await getLocation();
        const locationData = JSON.parse(location);

        userCoords[0] = locationData.coords.longitude;
        userCoords[1] = locationData.coords.latitude;
        if(firstTime){
          centerMap();

        }
      } catch (error) {
        console.error(error);
        alert("Une erreur est survenue lors de la récupération de la position. Veuillez relancer l'application RePlaced ;)");
      }
    };
    getUserLocation(firstTime)
    // Actualiser la position toutes les 2 secondes
    const intervalId = setInterval(getUserLocation, 2000);
    return () => clearInterval(intervalId);

  }, []);

  return (
    <View style={styles.container}>

      
      <MapView
      ref={mapRef}
        style={styles.map}
        region={mapRegion}
        
        showsUserLocation
      >

        {Object.values(pinList).map((pin, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: pin.lat, longitude: pin.long }}
            onPress={() => openModal({ lat: pin.lat, long: pin.long })}
          />
        ))}

      </MapView>
    
      <Pressable onPress={()=>centerMap()} style={styles.center_btn}>
        <Image source={require("./assets/buttons/center_map.png")} style={styles.center_btn_img}/>
      </Pressable>

      <PinModale modalVisible={pinModalVisible} setModalVisible={setPinModalVisible} setLogModalVisible={setLogModalVisible} coordonnes={CoordinateMarker}></PinModale>

      <LogSignModale modalVisible={logModalVisible} setModalVisible={setLogModalVisible} loginIsVisible={isLoginMenu} setLoginVisible={setLoginVisible}></LogSignModale>
      
      <StatusBar hidden={pinModalVisible} />
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
