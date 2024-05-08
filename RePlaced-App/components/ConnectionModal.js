import React,{cloneElement, useState} from "react";
import { View, Modal, Text, Pressable, Alert, StyleSheet, Linking,StatusBar, TextInput, Image} from "react-native";

// Import components
import LoginScreen  from './LoginScreen';
import SignupScreen from './SignupScreen';

import { useGlobalContext } from './GlobalContext';

const ConnectionModal = () => {

  const { connModalVisible, setConnModalVisible, connMenu, setConnMenu } = useGlobalContext();

  
  StatusBar.setHidden(false);
  StatusBar.setBackgroundColor('#1C62CA', true);
  StatusBar.setBarStyle('light-content');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={connModalVisible}
      onRequestClose={() => {
        setConnModalVisible(false);
      }}>
        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
          { 
            connMenu == 'login' ? 
            <LoginScreen ></LoginScreen> : 
            <SignupScreen></SignupScreen>
          }
          <Image style={styles.logoBottom} source={require('../assets/Logo RePlaced 2L.png')}/>

        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalView: {
      backgroundColor: '#1C62CA',
      width: '100%',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      paddingBottom: 40,
      paddingTop: 40,
    },

    logoBottom: {
      height: 50,
      resizeMode: 'contain',
    }
});

export default ConnectionModal;
