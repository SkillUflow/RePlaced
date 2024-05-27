import { useState } from "react";
import { View, Modal, Text, Pressable, StyleSheet, Linking, StatusBar, Image } from "react-native";
import { useGlobalContext } from './GlobalContext';


const PinModale = ({ modalVisible, setModalVisible, coordonnes, booked, bookedSelf, fetchData, setPinList, numPlaces, placeOrigin }) => {

  const [adresse, setAdress] = useState("");
  const {
    sessionKey,
    setConnModalVisible,
    serverURL,
    setAlertOpened,
    setAlertMessage,
    isNightMode,
    isLogged
  } = useGlobalContext(); // get values from globalContext

  let lat = coordonnes.lat;
  let long = coordonnes.long;

  const closeModal = () => {
    // Status bar style
    StatusBar.setBarStyle(isNightMode ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);

    setModalVisible(false);
  };

  // if the pinModale is opened
  const modalOpened = () => {
    setAdress('');
    getAdress();
    
    // Status bar style
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor(isNightMode ? '#092145' : 'white');
    StatusBar.setTranslucent(false);
  };

  // guide the user to his place
  const openGoogleMaps = () => {

    const latitude = lat;
    const longitude = long;
    const label = "Target Location";

    // URL for maps guiding
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving&dir_action=navigate&destination_place_id=${label}`;

    // Open the URL
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  // Get formatted adress
  const formatAdress = (adress, type) => {
    fullAdress = "";
    offset = 0;
    // Check if the first component is a number (e.g., street number)
    if (isNaN(adress[0])) {
      fullAdress += adress[0];
    }
    else {
      fullAdress += adress[0] + ", " + adress[1];
      offset = 1;
    }

    indexCity = 3;

    // Adjust the index based on the entity type
    switch (type) {
      case "way":
        // For "way" entities (e.g., streets), the city is at index 1
        indexCity = 1;
        break;
      case "node":
        // For "node" entities (e.g., buildings), the city is at index 3 + offset
        indexCity = 3 + offset;
    }

    // Append the city component to the full address
    fullAdress += ", " + adress[indexCity];

    return fullAdress;
  }


  // Retrieve the address from latitude and longitude coordinates
  const getAdress = async () => {

    // Construct the Nominatim API URL with the latitude and longitude coordinates
    const response = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${lat}%2C+${long}&format=jsonv2`, { method: "GET" });
    const resultat = await response.json();

    if (resultat.length == 0) return; // Exit the function if no result is returned

    // Split the full address into a list of components
    let listAdress = resultat[0]['display_name'].split(", ");
     // Format the address based on the entity type (city, country, etc...)
    let displayAdress = formatAdress(listAdress, resultat[0]["osm_type"]);

    // Update the state with the formatted address
    setAdress(displayAdress);

    return resultat
  }

  // Try booking a place
  const tryBook = async () => {

    const logInfo = await isLogged();

    // Is user is logged in, immediately book place
    if (logInfo.logged) {

      if (!booked) {

        // Hide the modal
        setConnModalVisible(false);

        const response = await fetch(serverURL + "/bookPlace", {
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

        const resultat = await response.json();

        if (resultat.response) {

          fetchData();

          setAlertMessage({ type: 'success', message: "Place réservée !" });
          setAlertOpened(true);
        }

        // If error while booking the placed
        else {
          setAlertMessage({ type: 'error', message: "Une erreur est survenue, assurez-vous d'être bien connecté(e) et réessayez." });
          setAlertOpened(true);
        }
      }

      // Cancel a booking
      else {
        setConnModalVisible(false);

        const response = await fetch(serverURL + "/unbookPlace", {
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

        const resultat = await response.json();

        if (resultat.response) {
          fetchData(serverURL, sessionKey, setAlertMessage, setAlertOpened, setPinList);
          setAlertMessage({ type: 'success', message: "Réservation annulée !" });
          setAlertOpened(true);
        }

        // If error while booking the place
        else {
          setAlertMessage({ type: 'error', message: "Une erreur est survenue, assurez-vous d'être bien connecté(e) et réessayez." });
          setAlertOpened(true);
        }
      }

      closeModal();
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
      onRequestClose={() => setModalVisible(!modalVisible)}
      onShow={modalOpened}
    >
      <Pressable style={styles.centeredView} onPress={() => closeModal()}>
        <View style={[styles.modalView, { backgroundColor: isNightMode ? '#092145' : 'white' }]} onStartShouldSetResponder={() => true}>
          <Text style={[styles.title, styles.kanitFont, { color: isNightMode ? 'white' : 'black' }]}>
            {bookedSelf ? 'Place réservée' : numPlaces + ' place' + (numPlaces > 1 ? 's' : '') + ' libre' + (numPlaces > 1 ? 's' : '')}
          </Text>
          
          { adresse != "" ? 
            <Text style={[styles.text, styles.kanitFont, { color: isNightMode ? 'white' : 'black' }]}>{adresse}</Text>:
            <Image style={styles.loader} src={'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/loader.gif?v=1715941786706'}></Image>
          }
          <Text style={styles.origin}>{placeOrigin == 'ocr' ? "Via une caméra en direct" : "Via OpenData"}</Text>

          <View style={styles.btnBox}>

            <Pressable onPress={tryBook} style={styles.btnPrimary}>
              <Text style={[styles.whiteText, styles.btnCenterText, styles.kanitFont]}>{bookedSelf ? 'Ne plus réserver' : 'Réserver'}</Text>
            </Pressable>

            <Pressable onPress={() => { openGoogleMaps() }} style={styles.btnSecondary}>
              <Text style={[styles.btnCenterText, styles.kanitFont, { color: isNightMode ? 'white' : 'black' }]}>Itinéraire</Text>
            </Pressable>

          </View>
        </View>
      </Pressable>
    </Modal>
  );
};


// General style around the map. 
// The style of the map itself (react native maps) is external.
const styles = StyleSheet.create({

  centeredView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },

  modalView: {
    display: 'flex',
    height: 'auto',
    width: "100%",
    marginTop: 0,
    backgroundColor: 'white',
    borderBottomLeftRadius: 52,
    borderBottomRightRadius: 52,
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

  btnCenterText: {
    textAlign: "center",
    fontSize: 28,
  },

  title: {
    fontSize: 40,
    fontFamily: "Kanit",
    marginBottom: 20,
  },

  text: {
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 33,
  },

  btnPrimary: {
    backgroundColor: "#1C62CA",
    borderRadius: 8,
    marginTop: 10,
    padding: 7,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  btnSecondary: {
    borderColor: "#1C62CA",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    padding: 7,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  whiteText: {
    color: "white",
  },

  kanitFont: {
    fontFamily: "Kanit",
  },

  loader: {
    width: 60,
    height: 60,
    marginBottom: 10
  },

  origin: {
    color: '#1C62CA',
    fontFamily: 'Kanit',
    fontStyle: 'italic'
  }
});

export default PinModale;