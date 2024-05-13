import React, { useEffect } from 'react';
import { View,Text,StyleSheet,Image,Pressable} from 'react-native';
import { useGlobalContext } from '../components/GlobalContext';


import image from "../assets/onboarding/imageOne.png"


const Welcome1 = () =>{

    
  useEffect(()=>{
    console.log("1");
  })
  
    return(

        <View style={styles.container}>
              
          <Image source={image} style={styles.mainImage}/>
          <Text style={[styles.text,styles.centerText]}>Ne vous souciez plus de trouver une place</Text>
          <View style={styles.circleContainer}>
                <Pressable style={styles.bigBtnContainer} onPress={() => navigation.navigate('Welcome1')}>
                  <Image style={styles.circle} source={require('../assets/buttons/circle.png')}></Image>
                </Pressable>
                <Pressable style={styles.smallBtnContainer} onPress={() => navigation.navigate('Welcome2')}>
                  <Image style={styles.circle} source={require('../assets/buttons/circle.png')}></Image>
                </Pressable>
                <Pressable style={styles.smallBtnContainer} onPress={() => navigation.navigate('Welcome3')}>
                  <Image style={styles.circle} source={require('../assets/buttons/circle.png')}></Image>
                </Pressable>
          </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor:"#1C62CA",
    paddingVertical:32
  },

  mainImage: {
    height: "60%",
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
  smallBtnContainer: {
    width: 20,
    height: 20,
  },
  bigBtnContainer: {
    width: 28,
    height: 28,
  },
  circle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },

  circleContainer: {
    flexDirection: 'row',
    width: '25%',
    alignItems: 'center',
    height: 80,
    marginBottom: 30,
    justifyContent: 'space-between'
  },

 

});
  
export default Welcome1;