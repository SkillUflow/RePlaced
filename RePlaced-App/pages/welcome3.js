import React from 'react';
import { View,Text,Button,StyleSheet,Pressable,Image, Modal } from 'react-native';

import { useGlobalContext } from '../components/GlobalContext';

import image from "../assets/onboarding/imageThree.png"


const Welcome3 = ({navigation, route}) =>{

  const {currentScreen, setCurrentScreen} = useGlobalContext();

    return(

        <View style={styles.container}>
              
              <Image source={image} style={styles.mainImage}/>
              <Text style={[styles.text,styles.centerText]}>Réservez la place et rendez vous y</Text>
              

              
            
             
              
                
          
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
  
export default Welcome3;