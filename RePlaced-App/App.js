import React, { useEffect, useState, useRef } from 'react';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable, Image, Text, Button} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import getLocation from './components/getLocation';
import Modale from './components/modale';


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


/*En attente de pouvoir les bouger ailleurs*/

const Welcome1 = ({navigation}) =>{
  return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Ecran d'accueil 1</Text>
          <Button title="X" onPress={() => {navigation.navigate("MainMap")}}></Button>
      </View>
  );
}

const Welcome2 = ({navigation}) =>{
  return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Ecran d'accueil 2</Text>
      </View>
  );
}

const Welcome3 = ({navigation}) =>{
  return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Ecran d'accueil 3</Text>
      </View>
  );
}

const Tab = createMaterialTopTabNavigator();

function WelcomeScreen() {
  return (
    <Tab.Navigator
    initialRouteName="Welcome1"
    screenOptions={{
      swipeEnabled: true, // Active le swipe entre les tabs ici
      tabBarStyle: { display: "none" } // Cache la barre de navigation des tabs
    }}
  >
    <Tab.Screen name="Welcome1" component={Welcome1} />
    <Tab.Screen name="Welcome2" component={Welcome2} />
    <Tab.Screen name="Welcome3" component={Welcome3} />
  </Tab.Navigator>
  );
}

const MainMap = () => {

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
    setModalVisible(!modalVisible);
    StatusBar.hidden=true;
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

      <Modale modalVisible={modalVisible} setModalVisible={setModalVisible} coordonnes={CoordinateMarker}></Modale>
      <StatusBar hidden={modalVisible} />
    </View>


  );
};

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="MainMap" component={MainMap} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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
