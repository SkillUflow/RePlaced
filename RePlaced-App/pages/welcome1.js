import React from 'react';
import { View,Text,Button,StyleSheet,Pressable,Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../components/GlobalContext';



import closeImg from "../assets/buttons/close.png"
import lineLogo from "../assets/lineLogo.png"
import image from "../assets/onboarding/imageOne.png"


const Welcome1 = ({navigation, route}) =>{

  const { sessionKey, setSessionKey, setConnModalVisible, serverURL } = useGlobalContext();

  async function tryLogin() {

    if(!sessionKey) {
      navigation.navigate("MainMap");
      setConnModalVisible(true);
    }

    else {

      const response = await fetch(serverURL + "/isLogged", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionKey
        })
      });

      const resultat = await response.json();
      
      // Is user is logged in, immediately go to map
      if(resultat.response) {
        navigation.navigate("MainMap");
        setConnModalVisible(false);
      }
      // Else, open login menu
      else {
        navigation.navigate("MainMap");
        setConnModalVisible(true);
      }
    }
  }
  
    return(

        <View style={{flex:1}}>
          <LinearGradient
            colors={['#1C62CA', '#174D9E']}
            style={styles.container}
          >
              <Pressable style={styles.closeBtn}  onPress={() => {navigation.navigate("MainMap")}}>
                <Image source={closeImg} style={styles.closeImg}/>
              </Pressable>
              <Image source={lineLogo} style={styles.LogoImage}/>
              <Image source={image} style={styles.mainImage}/>
              <Text style={[styles.text,styles.centerText]}>Ne vous souciez plus de trouver une place</Text>
              <Pressable style={styles.CTA} onPress={tryLogin}>
                <Text style={styles.text}>Me connecter</Text>
              </Pressable>
          </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%"
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: 50,
    height: 30,
    width: 30,
  },
  closeImg: {
    height: "100%",
    width: "100%",
  },
  mainImage: {
    height: "30%",
    resizeMode: "contain",
  },
  text: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontFamily: "KronaOne"
  },
  centerText: {
    width: "80%"
  },
  CTA: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 8
  },

  LogoImage: {
    width: '80%',
    resizeMode: 'contain'
  }
});
  
export default Welcome1