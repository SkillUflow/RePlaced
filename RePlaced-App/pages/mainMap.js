import { useEffect, useState, useRef } from 'react';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import { StyleSheet, View, Pressable, Image } from 'react-native';


// Components
import { useGlobalContext } from '../components/GlobalContext';
import SettingsModal from '../components/SettingsModal'
import { mapStyleDay, mapStyleNight } from '../components/mapStyles';
import { getLocation } from '../components/getLocation';
import ConnectionModal from '../components/ConnectionModal';
import PinModale from '../components/pinModale';
import AlertPopup from '../components/AlertPopup';


// Default coordinates
const defaultCoord = [3.048688, 50.634261];


const MainMap = ({ navigation, route }) => {

  let [userCoords, setUserCoords] = useState(defaultCoord); // Longitude et latitude par défaut

  const { serverURL, setAlertOpened, setAlertMessage, setSettingsOpen, settingsOpen, sessionKey, isNightMode, getPinList } = useGlobalContext();
  const [pinList, setPinList] = useState([]);


  if (!settingsOpen) {
    // StatusBar.setBarStyle(isNightMode ? 'light-content' : 'dark-content');
    // StatusBar.setBackgroundColor('transparent');
    // StatusBar.setTranslucent(true) 
  }

  useEffect(() => {

    fetchData();

    // Update pin map every 10s
    const intervalIdd = setInterval(fetchData, 10000);
    return () => clearInterval(intervalIdd);
  }, [serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList, isNightMode]);



  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [CoordinateMarker, setCoordinateMarker] = useState({ lat: 0.65, long: 45.9167 });
  const [UserLocated, setUserLocated] = useState(false);
  const [bookedPlace, setBookedPlaced] = useState(false);
  const [numPl, setNumPlaces] = useState(0);
  const [placeOrigin, setPlaceOrigin] = useState(false);
  const [update, setUpdate] = useState(true)


  const [mapRegion, setMapRegion] = useState({
    latitude: userCoords[1],
    longitude: userCoords[0],
    latitudeDelta: 0.020,
    longitudeDelta: 0.020,
  });

  const mapRef = useRef(null);

  const openModal = (coordinate, booked, numPl, placeOrigin) => {
    setCoordinateMarker(coordinate)
    setPinModalVisible(!pinModalVisible);
    setBookedPlaced(booked);
    setNumPlaces(numPl);
    setPlaceOrigin(placeOrigin);
  }

  const centerMap = (coords) => {
    mapRef.current.animateToRegion({
      latitude: coords[1],
      longitude: coords[0],
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500)
  }

  const fetchData = async () => {
    try {

      let parkings = await getPinList();
      
      if(parkings != pinList) {
        setUpdate(true)
      }

      setPinList(parkings);

    } catch (error) {
      setAlertMessage({ type: 'error', message: "Impossible d'accéder au serveur, veuillez relancer l'application" });
      setAlertOpened(true);
    }
  };

  const findClosest = () => {

    if(pinList.length == 0) {
      setAlertMessage({
        type: 'error',
        message: 'Impossible de récupérer les places de parking'
      });
      setAlertOpened(true);
      setTimeout(() => setAlertOpened(false), 10000)
      return
    }

    function calcDistance(pin) {
      let dis = {
        distX: pin.lat - userCoords[1],
        distY: pin.long - userCoords[0]
      }

      let radius = Math.sqrt(dis.distX * dis.distX + dis.distY * dis.distY);

      return radius
    }

    let closestPin = pinList[0];
    let minDistance = calcDistance(closestPin);

    for (let i = 1; i < pinList.length; ++i) {

      let newDistance = calcDistance(pinList[i]);

      if (newDistance < minDistance) {
        minDistance = newDistance;
        closestPin = pinList[i];
      }
    }

    centerMap([closestPin.long, closestPin.lat]);
    openModal({ lat: closestPin.lat, long: closestPin.long }, closestPin.booked.length != 0 ? true : false, closestPin.numPlaces - closestPin.booked.length - closestPin.numBooked, closestPin.placeOrigin)

    return closestPin;

  }



  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await getLocation();
        const locationData = await JSON.parse(location);

        setUserCoords([locationData.coords.longitude, locationData.coords.latitude])

        if (!UserLocated) {
          setUserLocated(prevUserLocated => {
            if (!prevUserLocated && userCoords != defaultCoord) {
              centerMap(userCoords); // Appelez centerMap() si UserLocated est toujours false
              return true; // Mettez à jour UserLocated à true
            }
            return false; // Retourne l'état précédent si UserLocated est déjà true
          });

        }
      } catch (error) {
        setAlertOpened(true);
        setAlertMessage({ type: 'error', message: "Une erreur est survenue lors de la récupération de la position. Veuillez relancer l'application RePlaced ;)" });
      }
    };

    getUserLocation()
    // Actualiser la position toutes les 2 secondes
    const intervalId = setInterval(getUserLocation, 2000);
    return () => clearInterval(intervalId);

  }, []);
  

  useEffect(() => {
    fetchData()
  }, [])

  let Pin = pinList.find(pin => sessionKey != false && pin.booked.length != 0 && pin.booked.find(booker => booker == sessionKey));

  return (

    <View style={styles.container}>


      <MapView  
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={isNightMode ? mapStyleNight : mapStyleDay}
        toolbarEnabled={false}
      >
        {
        update ?
        pinList.filter(pin => pin.booked.length + pin.numBooked < pin.numPlaces || pin == Pin).map((pin, index) => {
          if(index == pinList.length - 1) setUpdate(false);
          return (
          <Marker
            key={`${index}-${Pin ? 'booked' : 'notBooked'}`}
            coordinate={{ latitude: pin.lat, longitude: pin.long }}
            onPress={() => openModal({ lat: pin.lat, long: pin.long }, pin.booked.length != 0 ? true : false, pin.numPlaces - pin.booked.length - pin.numBooked, pin.placeOrigin)}
            pinColor={pin.booked.length != 0 ? 'aqua' : pin.placeOrigin == 'api' ? 'blue' : 'red'}
            flat={false}
          />
        )}) : null}

      </MapView>
      <View style={styles.btnContainer}>

        <View style={styles.btnBox}>

          <Pressable onPress={() => findClosest()} style={styles.center_btn}>
            <Image src={'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/parkingIcon.png?v=1715939490465'} style={styles.center_btn_img} />
          </Pressable>
        </View>

        <View style={styles.btnBox}>

          <Pressable onPress={() => setSettingsOpen(true)} style={styles.center_btn}>
            <Image src={'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/screw.png?v=1715939489328'} style={styles.center_btn_img} />
          </Pressable>

          <Pressable onPress={() => centerMap(userCoords)} style={styles.center_btn}>
            <Image src={'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/pin.png?v=1715939488842'} style={styles.center_btn_img} />
          </Pressable>
        </View>
      </View>

      <PinModale
        modalVisible={pinModalVisible}
        setModalVisible={setPinModalVisible}
        fetchData={fetchData}
        coordonnes={CoordinateMarker}
        booked={bookedPlace}
        numPlaces={numPl}
        placeOrigin={placeOrigin}
        setPinList={setPinList}
      ></PinModale>

      <ConnectionModal />

      <SettingsModal navigation={navigation} />

      <AlertPopup />

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    top: 0,
    height: '100%',
    backgroundColor: 'red',
    justifyContent: 'center',
  },
  map: {
    display: 'flex',
    height: '110%'
  },
  btnContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0
  },
  btnBox: {
    width: '100%',
    bottom: 0,
    padding: 15,
    paddingTop: 0,
    display: "flex",
    flexDirection: "row",
    justifyContent: 'space-between'
  },
  center_btn: {
    backgroundColor: '#1C62CA',
    borderRadius: 500,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5,
  },

  center_btn_img: {
    height: '60%',
    width: '100%',
    resizeMode: 'contain'
  }
});

export default MainMap;