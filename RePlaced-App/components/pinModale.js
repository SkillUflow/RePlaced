import React,{useState, useRef} from "react";
import { View, Modal, Text, Pressable, Alert, StyleSheet, Linking, StatusBar} from "react-native";
import { useGlobalContext } from './GlobalContext';

const PinModale = ({ modalVisible, setModalVisible, coordonnes}) => {

  const { sessionKey, setConnModalVisible, serverURL } = useGlobalContext();

  let lat = coordonnes.lat
  let long = coordonnes.long

  const closeModal = () => {
      setModalVisible(false);
      StatusBar.hidden=false;
  };


  const openGoogleMaps = () => {
    const latitude =50.629850; // Latitude de la destination
    const longitude = 3.066374; // Longitude de la destination
    const label = "Target Location"; // Label de la destination

    // Format de l'URL pour l'itinéraire Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving&dir_action=navigate&destination_place_id=${label}`;

    // Ouvrir l'URL dans Google Maps
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

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
    console.log("Résultat :", resultat);
    
    // Is user is logged in, immediately book place
    if(resultat.response) {
      setConnModalVisible(false);
    }
    // Else, open login menu
    else {
      setConnModalVisible(true);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <Pressable style={styles.centeredView} onPress={()=>closeModal()}>
        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
            <Text style={styles.title}>3 places libres</Text>
            <Text style={styles.text}>1 rue Watto</Text>
            <Text>{coordonnes.lat},{coordonnes.long}</Text>
            <View style={styles.btnBox}>
              <Pressable onPress={() =>openGoogleMaps()} style={styles.btnPrimary}>
                <Text  style={[styles.whiteText,styles.btnCenterText]}>Y aller</Text>
              </Pressable>

              <Pressable style={styles.btnSecondary} onPress={tryBook}>
                <Text style={[styles.btnCenterText]}>Je vais me garer ici</Text>
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
    flex:0.3,
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
  },
  btnCenterText:{
    textAlign:"center",
    fontSize:30
  },

  title:{
    fontSize:30,
    fontWeight:"bold"
  },
  text:{
    fontSize:30,
    fontWeight:"300"
  },

  btnBox:{
    flex:1,
    justifyContent:"space-evenly"
  },
  btnPrimary:{
    backgroundColor:"#1C62CA",
    borderRadius:8
  },
  whiteText:{
    color:"white",
  },

  btnSecondary:{
    borderColor:"#1C62CA",
    backgroundColor:"transparent",
    borderWidth:1,
    borderRadius: 8
  }

  
});

export default PinModale;
