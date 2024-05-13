import React, { useEffect } from 'react';
import { View,Text,StyleSheet,Image} from 'react-native';
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
    height: "70%",
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

  

 

});
  
export default Welcome1;