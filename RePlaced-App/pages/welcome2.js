import React from 'react';
import { View,Text,Button,StyleSheet,Pressable,Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../components/GlobalContext';



import closeImg from "../assets/buttons/close.png"
import lineLogo from "../assets/lineLogo.png"
import image from "../assets/onboarding/imageTwo.png"


const Welcome2 = ({navigation, route}) =>{

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
              <Text style={[styles.text,styles.centerText]}>Trouvez une place là où vous souhaitez vous garer</Text>
              <Image source={image} style={styles.mainImage}/>
              <Pressable style={styles.CTA} onPress={tryLogin}>
                <Text style={styles.text}>Me connecter</Text>
              </Pressable>
              <View style={styles.circleContainer}>
                <Pressable style={styles.smallBtnContainer} onPress={() => navigation.navigate('Welcome1')}>
                  <Image style={styles.circle} source={require('../assets/buttons/circle.png')}></Image>
                </Pressable>
                <Pressable style={styles.bigBtnContainer} onPress={() => navigation.navigate('Welcome2')}>
                  <Image style={styles.circle} source={require('../assets/buttons/circle.png')}></Image>
                </Pressable>
                <Pressable style={styles.smallBtnContainer} onPress={() => navigation.navigate('Welcome3')}>
                  <Image style={styles.circle} source={require('../assets/buttons/circle.png')}></Image>
                </Pressable>
              </View>
            
             
              
                
          </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    justifyContent: "space-between",
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
  },
  

  circleContainer: {
    flexDirection: 'row',
    width: '30%',
    alignItems: 'center',
    height: 80,
    marginBottom: 30,
    justifyContent: 'space-between'
  },

  smallBtnContainer: {
    width: '20%',
    height: '20%',
  },

  bigBtnContainer: {
    width: '35%',
    height: '35%',
  },

  circle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  }
});
  
export default Welcome2;