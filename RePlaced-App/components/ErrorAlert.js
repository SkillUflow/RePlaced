import React, { useState } from 'react';
import { View,Text,Pressable,Image} from 'react-native';

import closeImg from "../assets/buttons/close.png"

const ErrorAlert = ({message,visibility}) =>{

    [visible, setVisible] = useState(visibility);
    
    if(visible == true){
        display = "flex"
    }else{
        display = "none"
    }

    return(
        <View style={{width:'100%', position:'absolute', bottom:16,flex:1,alignItems:"center", display:display}}>
            <View style={{width:'80%', padding:8, backgroundColor:"red", borderRadius:8}}>
                <Text style={{color:"white", textAlign:"center"}}>{message}</Text>
                <Pressable style={{position:"absolute",right:0,height: 30,width: 30}} onPress={() => {setVisible(false)}}>
                <Image source={closeImg} style={{height:"100%",width:"100%"}} />
              </Pressable>
            </View>       
        </View>
    )
}


export default ErrorAlert