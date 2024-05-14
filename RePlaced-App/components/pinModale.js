import React,{useState, useRef} from "react";
import { View, Modal, Text, Pressable, Alert, StyleSheet, Linking, StatusBar} from "react-native";
import { useGlobalContext } from './GlobalContext';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const PinModale = ({ modalVisible, setModalVisible, coordonnes, booked, fetchData, setPinList, numPlaces}) => {

  

  const [adresse,setAdresse]= useState("");
  const { sessionKey, setConnModalVisible, serverURL, setAlertOpened, setAlertMessage } = useGlobalContext();

  let lat = coordonnes.lat
  let long = coordonnes.long

 

  const closeModal = () => {
      setModalVisible(false);
      StatusBar.hidden=false;
  };


  const openGoogleMaps = () => {
    const latitude =lat; // Latitude de la destination
    const longitude = long; // Longitude de la destination
    const label = "Target Location"; // Label de la destination

    // Format de l'URL pour l'itinéraire Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving&dir_action=navigate&destination_place_id=${label}`;

    // Ouvrir l'URL dans Google Maps
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };


  const formatAdresse = (adresse,type) =>{
    fullAdresse = "";
    offset = 0
    if(isNaN(adresse[0])){
      fullAdresse+= adresse[0];
    }
    else{
      fullAdresse += adresse[0]+", "+adresse[1];
      offset =1;
    }

    indexCity = 3;
    switch (type){
      case "way":
        indexCity = 1
        break;
      case "node":
        indexCity = 3+offset;
    }
    fullAdresse+=", "+adresse[indexCity]


    return fullAdresse;
  }


  async function getAdresse(){
    const response = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${lat}%2C+${long}&format=jsonv2`, {
      method: "GET",
    });

    const resultat = await response.json();

    if(resultat.length == 0) return;

    // console.log(resultat[0]['display_name'])
    let listAdresse = resultat[0]['display_name'].split(", ");
    // console.log(listAdresse);
    
    displayAdresse = formatAdresse(listAdresse,resultat[0]["osm_type"]);
    setAdresse(displayAdresse)
    return resultat
  }

  async function tryBook() {
    
    const response = await fetch(serverURL + "/isLogged", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey
      }),
    });

    const resultat = await response.json();
    
    // Is user is logged in, immediately book place
    if(resultat.response) {

      if(! booked) {

        setConnModalVisible(false);

        const response2 = await fetch(serverURL + "/bookPlace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionKey,
            lat,
            long
          }),
        });

        const resultat2 = await response2.json();

        if(resultat2.response) {
          
          fetchData(serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList);
          setAlertMessage({type: 'success', message: "Place réservée !"});
          setAlertOpened(true);
        }

        // If error while booking the placed
        else {
          setAlertMessage({type: 'error', message: "Une erreur est survenue, assurez-vous d'être bien connecté(e) et réessayez"});
          setAlertOpened(true);
        }
      }

      // Cancel a booking
      else {
        setConnModalVisible(false);

        const response2 = await fetch(serverURL + "/unbookPlace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionKey,
            lat,
            long
          }),
        });

        const resultat2 = await response2.json();

        if(resultat2.response) {
          
          fetchData(serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList);
          setAlertMessage({type: 'success', message: "Réservation annulée !"});
          setAlertOpened(true);
        }

        // If error while booking the placed
        else {
          setAlertMessage({type: 'error', message: "Une erreur est survenue, assurez-vous d'être bien connecté(e) et réessayez"});
          setAlertOpened(true);
        }
      }
    }
    // Else, open login menu
    else {
      setConnModalVisible(true);
    }
  }

getAdresse()

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <Pressable style={styles.centeredView} onPress={()=>closeModal()}>
        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
          <Text style={[styles.title, styles.kanitFont]}>
            {booked ? 'Place réservée' : numPlaces + ' place' + (numPlaces > 1 ? 's': '') + ' libre' + (numPlaces > 1 ? 's': '')}
          </Text>
            <Text style={[styles.text, styles.kanitFont]}>{adresse}</Text>
            
            <View style={styles.btnBox}>
              
              <Pressable onPress={tryBook} style={styles.btnPrimary}>
                <Text  style={[styles.whiteText,styles.btnCenterText, styles.kanitFont]}>{booked ? 'Ne plus réserver' : 'Réserver'}</Text>
              </Pressable>

              <Pressable onPress={() =>{openGoogleMaps()}} style={styles.btnSecondary}>
                <Text  style={[styles.btnCenterText, styles.kanitFont]}>Itinéraire</Text>
              </Pressable>

            </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  
  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparence ajoutée
  },

  modalView: {
    display: 'flex',
    height: 'auto',
    width:"100%",
    marginTop:0,
    backgroundColor: 'white',
    borderBottomLeftRadius:52,
    borderBottomRightRadius:52,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    fontFamily: 'Kanit'
  },

  btnCenterText:{
    textAlign:"center",
    fontSize:28,
  },

  title:{
    fontSize:40,
    fontFamily: "Kanit",
    marginBottom:20,
  },

  text:{
    fontSize:30,
    fontWeight:"300",
    lineHeight:33,
  },

  btnPrimary:{
    backgroundColor:"#1C62CA",
    borderRadius:8,
    marginTop:10,
    padding: 7,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  btnSecondary:{
    borderColor:"#1C62CA",
    backgroundColor:"transparent",
    borderWidth:1,
    borderRadius: 8,
    marginTop:10,
    padding: 7,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  whiteText:{
    color:"white",
  },

  kanitFont:{
    fontFamily: "Kanit",
  }

  
});

export default PinModale;