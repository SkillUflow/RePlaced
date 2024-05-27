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


const MainMap = ({ navigation, route }) => {

  const { serverURL, setAlertOpened, setAlertMessage, setSettingsOpen, settingsOpen, sessionKey, isNightMode, getPinList } = useGlobalContext();


  const [pinList, setPinList]                   = useState([]);
  const [userCoords, setUserCoords]             = useState({});
  const [pinModalVisible, setPinModalVisible]   = useState(false);
  const [CoordinateMarker, setCoordinateMarker] = useState({ lat: 0.65, long: 45.9167 });
  const [UserLocated, setUserLocated]           = useState(false);
  const [bookedPlace, setBookedPlaced]          = useState(false);
  const [bookedPlaceSelf, setBookedPlacedSelf]  = useState(false);
  const [numPl, setNumPlaces]                   = useState(0);
  const [placeOrigin, setPlaceOrigin]           = useState(false);
  const [update, setUpdate]                     = useState(true)




  useEffect(() => {   //get the parking's data and update the pins

    fetchData();


    // Update pin map every 10s
    const intervalIdd = setInterval(fetchData, 10000);

    return () => {clearInterval(intervalIdd)};

  }, [serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList, isNightMode]);


  useEffect(() => {    //locate the user and center the map

    const getPosition = async() => {

      let locationData = await fetchPosition();

      setMapRegion({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        latitudeDelta: 0.020,
        longitudeDelta: 0.020,
      })

      setUserLocated(true);
    }

    getPosition();
    

  }, [])


  const fetchPosition = async () => {

    const location = await getLocation();
    const locationData = await JSON.parse(location);

    setUserCoords(locationData);

    return locationData;
  }

  const [mapRegion, setMapRegion] = useState({});

  const mapRef = useRef(null);

  const openModal = (coordinate, booked, bookedSelf, numPl, placeOrigin) => { //manage the modals opening when a pin is pressed
    setCoordinateMarker(coordinate)
    setPinModalVisible(!pinModalVisible);
    setBookedPlaced(booked);
    setBookedPlacedSelf(bookedSelf);
    setNumPlaces(numPl);
    setPlaceOrigin(placeOrigin);
  }

  const centerMap = async (coords) => { //center the map on the user location

    if(!coords) {
      fetchPosition();

      setTimeout(() => {

        mapRef.current.animateToRegion({
          latitude: userCoords.coords.latitude,
          longitude: userCoords.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 500)
        
      }, 250);
    }

    else {
      mapRef.current.animateToRegion({
        latitude: coords[1],
        longitude: coords[0],
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500)
    }
  }

  const fetchData = async () => {  //fetch the parking data from the server
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

  const findClosest = async () => { //find the nearest parking of the user

    fetchPosition();

    setTimeout(() => {

      let locationData = userCoords;

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
          distX: pin.lat - locationData.coords.latitude,
          distY: pin.long - locationData.coords.longitude
        }
  
        let radius = Math.sqrt(dis.distX * dis.distX + dis.distY * dis.distY);
  
        return radius
      }
  
      let pinListFree = pinList.filter(pin => pin.booked.length + pin.numBooked < pin.numPlaces);
      let closestPin = pinListFree[0];
      let minDistance = calcDistance(closestPin);
  
      for (let i = 1; i < pinListFree.length; ++i) {  //find the nearest pin
  
        let newDistance = calcDistance(pinListFree[i]);
  
        if (newDistance < minDistance) {
          minDistance = newDistance;
          closestPin = pinListFree[i];
        }
      }
  
      let bookedSelf = closestPin.booked.find(key => key == sessionKey) ? true : false;
  
      centerMap([closestPin.long, closestPin.lat]);
      openModal({ lat: closestPin.lat, long: closestPin.long }, closestPin.booked.length != 0 ? true : false, bookedSelf, closestPin.numPlaces - closestPin.booked.length - closestPin.numBooked, closestPin.placeOrigin)
  
      return closestPin;
      
    }, 250);

  }

  

  useEffect(() => {
    fetchData();
  }, [])

  let Pin = pinList.find(pin => sessionKey != false && pin.booked.length != 0 && pin.booked.find(booker => booker == sessionKey));

  return UserLocated ? (

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
            onPress={() => openModal(
              { lat: pin.lat, long: pin.long }, 
              pin.booked.length != 0 ? true : false, 
              pin.booked.find(key => sessionKey == key) ? true : false, 
              pin.numPlaces - pin.booked.length - pin.numBooked, 
              pin.placeOrigin
            )}
            pinColor={pin.booked.find(key => sessionKey == key) ? 'aqua' : pin.placeOrigin == 'api' ? 'blue' : 'red'}
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

          <Pressable onPress={() => centerMap()} style={styles.center_btn}>
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
        bookedSelf={bookedPlaceSelf}
        numPlaces={numPl}
        placeOrigin={placeOrigin}
        setPinList={setPinList}
      ></PinModale>

      <ConnectionModal />

      <SettingsModal navigation={navigation} />

      <AlertPopup />

    </View>
  ) : 
  null
};


const styles = StyleSheet.create({
  container: {
    top: 0,
    height: '100%',
    backgroundColor: 'white',
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