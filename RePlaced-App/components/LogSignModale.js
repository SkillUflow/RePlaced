import React,{cloneElement, useState} from "react";
import { View, Modal, Text, Pressable, Alert, StyleSheet, Linking,StatusBar, TextInput, Image} from "react-native";
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {bookPlace} from "./tools";

const Stack = createNativeStackNavigator();

const LoginScreen = ({setModalVisible, setLoginVisible}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>

      <Text style={styles.label}>Email adress</Text>
      <TextInput style={styles.input} placeholder="Enter your email adress..." />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Enter your password..." />

      <Pressable style={styles.submitBtn}>
        <Text style={styles.submitText}>Connect!</Text>
      </Pressable>

      <View style={styles.topContainer}>
        <Pressable style={styles.link} onPress={() => setModalVisible(false)}><Text style={styles.linkText}>Back to map</Text></Pressable>
        <Pressable style={styles.link} onPress={() => setLoginVisible(false)}><Text style={styles.linkText}>No account? Sign up</Text></Pressable>
      </View>
    </View>
  )
}

const SignupScreen = ({setModalVisible, setLoginVisible}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New account</Text>

      <Text style={styles.label}>Surname</Text>
      <TextInput style={styles.input} placeholder="Enter your surname..." />
      <Text style={styles.label}>Email adress</Text>
      <TextInput style={styles.input} placeholder="Enter your email adress..." />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Enter your password..." />

      <Pressable style={styles.submitBtn}>
        <Text style={styles.submitText}>Sign up!</Text>
      </Pressable>

      <View style={styles.topContainer}>
        <Pressable style={styles.link} onPress={() => setModalVisible(false)}><Text style={styles.linkText}>Back to map</Text></Pressable>
        <Pressable style={styles.link} onPress={() => setLoginVisible(true)}><Text style={styles.linkText}>Log in</Text></Pressable>
      </View>
    </View>
  )
}

const LogSignModale = ({ modalVisible, loginIsVisible, setLoginVisible, setModalVisible}) => {
  

  const closeModal = () => {
    setModalVisible(false);
    StatusBar.hidden=false;
  };

  StatusBar.setHidden(false);
  StatusBar.setBackgroundColor('#1C62CA', true);
  StatusBar.setBarStyle('light-content');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
          { 
            loginIsVisible ? 
            <LoginScreen  setModalVisible={setModalVisible} setLoginVisible={setLoginVisible}></LoginScreen> : 
            <SignupScreen setModalVisible={setModalVisible} setLoginVisible={setLoginVisible}></SignupScreen>
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

    container: {
      width: '85%',
      backgroundColor: '#FFF',
      borderRadius: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
      paddingBottom: 10,
      alignItems: 'center'
    },

    topContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
      marginBottom: 10
    },

    title: {
      fontSize: 40,
      fontWeight: '700',
      color: '#1C62CA',
      marginBottom: 20
    },

    label: {
      fontSize: 25,
      fontWeight: '500',
      width: '100%',
      marginBottom: 5
    },

    input :{
      width: '100%',
      marginBottom: 20,
      fontSize: 20,
      borderColor: '#1C62CA',
      borderWidth: 2,
      padding: 5,
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 10
    },
    logoBottom: {
      height: 50,
      resizeMode: 'contain',
    },

    submitBtn: {
      backgroundColor: '#1C62CA',
      padding: 10,
      borderRadius: 15,
      alignItems: 'center',
      marginBottom: 10
    },

    submitText: {
      color: 'white',
      fontSize: 20,
      paddingLeft: 10,
      paddingRight: 10,
    },

    linkText: {
      fontSize: 17,
      color: '#1C62CA',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10
    }
});

export default LogSignModale;
