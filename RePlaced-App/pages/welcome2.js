import React from 'react';
import { View,Text,Button,StyleSheet,Pressable,Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


import closeImg from "../assets/buttons/close.png"
import lineLogo from "../assets/lineLogo.png"
import imageOne from "../assets/onboarding/imageOne.png"



const Welcome2 = ({navigation}) =>{
  
    return(

        <View style={{flex:1}}>
          <LinearGradient
            colors={['#1C62CA', '#174D9E']}
            style={styles.container}
          >
              <Pressable style={styles.closeBtn}>
                <Image source={closeImg} style={styles.closeImg}/>
              </Pressable>
              <Image source={lineLogo} style={styles.LogoImage}/>
              <Image source={imageOne} style={styles.mainImage}/>
              <Text style={[styles.text,styles.centerText]}>Ne vous souciez plus de trouver une place</Text>
              <Pressable style={styles.CTA}>
                <Text style={styles.text}>Me connecter</Text>
              </Pressable>
    </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent:"space-evenly",
      alignItems:"center",
      width:"100%"
    },
    closeBtn:{
      position:"absolute",
      right:20,
      top:50,
      height:30,
      width:30,
    },
    closeImg:{
      height:"100%",
      width:"100%"
    },
    mainImage:{
      height:"30%",
      resizeMode:"contain",
    },
    text:{
      fontSize:24,
      color:"white",
      textAlign:"center",
      fontFamily:"KronaOne"
    },
    centerText:{
      width:"80%"
    },
    CTA:{
      borderWidth:1,
      borderColor:"white",
      borderRadius:16,
      paddingHorizontal:32,
      paddingVertical:8
    }
  });
  
export default Welcome2