import React, { useEffect, useState, useRef } from 'react';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import { StyleSheet, View, Pressable, Image, Text, StatusBar} from 'react-native';
import { getLocation } from '../components/getLocation';
import ConnectionModal from '../components/ConnectionModal';
import PinModale from '../components/pinModale';



const MainMap = ({navigation, route}) => {

  let userCoords    = route.params.userCoords;
  let pinList       = route.params.pinList;




  const [pinModalVisible, setPinModalVisible]   = useState(false);
  const [CoordinateMarker, setCoordinateMarker] = useState({lat:0.65, long:45.9167});
  const [UserLocated, setUserLocated] = useState(false)

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

  const centerMap = ()=>{
    mapRef.current.animateToRegion({
      latitude:userCoords[1],
      longitude: userCoords[0],
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    },500)
    
  }



  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await getLocation();
        const locationData = JSON.parse(location);

        userCoords[0] = locationData.coords.longitude;
        userCoords[1] = locationData.coords.latitude;
        if(!UserLocated){
          setUserLocated(prevUserLocated => {
            if (!prevUserLocated) {
              centerMap(); // Appelez centerMap() si UserLocated est toujours false
              return true; // Mettez à jour UserLocated à true
            }
            return prevUserLocated; // Retourne l'état précédent si UserLocated est déjà true
          });
        }
      } catch (error) {
        console.error(error);
        alert("Une erreur est survenue lors de la récupération de la position. Veuillez relancer l'application RePlaced ;)");
      }
    };
    getUserLocation()
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
        <Image source={require("../assets/buttons/center_map.png")} style={styles.center_btn_img}/>
      </Pressable>

      <PinModale 
        modalVisible={pinModalVisible} 
        setModalVisible={setPinModalVisible} 
        coordonnes={CoordinateMarker}
      ></PinModale>

      <ConnectionModal />

      <StatusBar hidden={pinModalVisible} />
    </View>


  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#505005',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  center_btn: {
    width: 10,
    position: 'absolute',
    bottom: 20,
    left: 20,
  },

  center_btn_img: {
    height: 80,
    width: 80,
  }
});  

export default MainMap;