import React, { useEffect, useState, useRef } from 'react';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import { StyleSheet, View, Pressable, Image, Text, StatusBar} from 'react-native';
import { getLocation } from '../components/getLocation';
import ConnectionModal from '../components/ConnectionModal';
import PinModale from '../components/pinModale';
import AlertPopup from '../components/AlertPopup';
import SettingsModal from '../components/SettingsModal'
import { useGlobalContext } from '../components/GlobalContext';
import {mapStyleDay, mapStyleNight} from '../components/mapStyles';


const fetchData = async (serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList) => {
  try {

    const response = await fetch(serverURL + "/pinList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey
      }),
    });

    const resultat = await response.json();

    setPinList(resultat.db);

  } catch (error) {
    setAlertMessage({type: 'error', message: "Impossible d'accéder au serveur, veuillez relancer l'application"});
    setAlertOpened(true);
  }
};

const MainMap = ({navigation, route}) => {

  let userCoords    = route.params.userCoords;

  const { serverURL, setAlertOpened, setAlertMessage, setSettingsOpen, sessionKey } = useGlobalContext();
  const [pinList, setPinList ] = useState([]);




  useEffect(() => {
    fetchData(serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList);

    // Update pin map every 10s
    const intervalIdd = setInterval(fetchData, 10000, serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList);
    return () => clearInterval(intervalIdd);
  }, [serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList]);



  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [CoordinateMarker, setCoordinateMarker] = useState({lat:0.65, long:45.9167});
  const [UserLocated, setUserLocated] = useState(false);
  const [bookedPlace, setBookedPlaced] = useState(false);
  const [numPl, setNumPlaces] = useState(0);


  const [mapRegion, setMapRegion] = useState({
    latitude: userCoords[1],
    longitude: userCoords[0],
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  const mapRef = useRef(null);

  const openModal = (coordinate, booked, numPl)=>{
    setCoordinateMarker(coordinate)
    setPinModalVisible(!pinModalVisible);
    setBookedPlaced(booked)
    setNumPlaces(numPl)
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
        setAlertOpened(true);
        setAlertMessage({type: 'error', message: "Une erreur est survenue lors de la récupération de la position. Veuillez relancer l'application RePlaced ;)"});
      }
    };

    getUserLocation()
    // Actualiser la position toutes les 2 secondes
    const intervalId = setInterval(getUserLocation, 2000);
    return () => clearInterval(intervalId);

  }, []);


  let Pin = pinList.find(pin => sessionKey != false && pin.booked == sessionKey);

  return (

    <View style={styles.container}>

      
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={mapStyleDay}
      >
        {pinList.filter(pin => pin.booked.length == 0 || pin == Pin).map((pin, index) => (
          <Marker
            key={`${index}-${Pin ? 'booked':'notBooked'}`}
            coordinate={{ latitude: pin.lat, longitude: pin.long }}
            onPress={() => openModal({ lat: pin.lat, long: pin.long }, pin.booked.length != 0 ? true : false, pin.numPlaces - pin.booked.length)}
            pinColor={pin.booked.length != 0 ? 'aqua':'red'}
          />
        ))}

      </MapView>
      <View style={styles.btnBox}>

        <Pressable onPress={()=>setSettingsOpen(true)} style={styles.center_btn}>
          <Image source={require("../assets/buttons/screw.png")} style={styles.center_btn_img}/>
        </Pressable>

        <Pressable onPress={()=>centerMap()} style={styles.center_btn}>
          <Image source={require("../assets/buttons/pin.png")} style={styles.center_btn_img}/>
          
        </Pressable>
      </View>
      <PinModale 
        modalVisible={pinModalVisible} 
        setModalVisible={setPinModalVisible}
        fetchData={fetchData}
        coordonnes={CoordinateMarker}
        booked={bookedPlace}
        numPlaces={numPl}
        setPinList={setPinList}
      ></PinModale>

      <ConnectionModal />

      <SettingsModal navigation={navigation} />

      <AlertPopup />

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
  btnBox:{
    width: '100%',
    position: 'absolute',
    bottom: 0,
    padding: 15,
    display:"flex",
    flexDirection:"row",
    justifyContent: 'space-between'
  },
  center_btn: {
    backgroundColor: '#1C62CA',
    borderRadius: 500,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },

  center_btn_img: {
    height: '60%',
    resizeMode: 'contain'
  }
});  

export default MainMap;