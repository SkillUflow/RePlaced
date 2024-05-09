import React,{cloneElement, useState} from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import CryptoJS from 'crypto-js';


// Context elements
import { useGlobalContext } from './GlobalContext';

// Hashing password
const hashPassword = (password) => {
  const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  return hashedPassword;
};


const LoginScreen = () => {

  // Variables used for inputs
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get global variables
  const { sessionKey, setSessionKey, connModalVisible, setConnModalVisible, connMenu, setConnMenu, serverURL } = useGlobalContext();



  const login = async () => {

    try {

      // Request to server to ask for login
      const response = await fetch(serverURL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: hashPassword(password)
        }),
      });
  
      // Turn the result into JSON readable
      const resultat = await response.json();

      // If error
      if(!resultat.response) {
        setErrorMessage('Error: ' + resultat.error);
      }
      else {
        setSessionKey(resultat.key); // Set the session key    
        setConnModalVisible(false);  // Hide the connection modal
      }

    } catch (erreur) {
      setErrorMessage("Error:", erreur);
    }
    
  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Connexion</Text>

      { errorMessage != "" ? <Text style={styles.error}>{errorMessage}</Text> : null /* Display or not error message */ }

      <Text style={styles.label}>Adresse email</Text>
      <TextInput 
        onChangeText={mail => setEmail(mail)}
        defaultValue={email}
        autoComplete='email'
        autoCapitalize='none'
        style={styles.input}
        placeholder="Entrer votre adresse email..." 
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput 
        onChangeText={pass => setPassword(pass)}
        secureTextEntry
        defaultValue={password}
        autoComplete='current-password'
        autoCapitalize='none'
        style={styles.input} 
        placeholder="Entrer votre mot de passe..." 
      />

      <Pressable style={styles.submitBtn} onPress={login}>
        <Text style={styles.submitText}>Se connecter</Text>
      </Pressable>

      <View style={styles.topContainer}>
        <Pressable style={styles.link} onPress={() => setConnModalVisible(false)}>
          <Text style={styles.linkText}>Retour à la carte</Text>
        </Pressable>

        <Pressable style={styles.link} onPress={() => setConnMenu('signup')}>
          <Text style={styles.linkText}>S'inscrire</Text>
        </Pressable>

      </View>
    </View>

  )
}

const styles = StyleSheet.create({
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
    fontFamily: "KronaOne",
    fontSize: 35,
    color: '#1C62CA',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center'
  },

  label: {
    fontSize: 18,
    fontWeight: '500',
    width: '100%',
    marginBottom: 5,
    paddingLeft: 10,
    fontFamily: "KronaOne"
  },

  input: {
    width: '100%',
    marginBottom: 20,
    fontSize: 15,
    borderColor: '#1C62CA',
    borderWidth: 2,
    padding: 3,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    fontFamily: "KronaOne"
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
    marginBottom: 10,
  },

  submitText: {
    color: 'white',
    fontSize: 20,
    paddingLeft: 10,
    paddingRight: 10,
    fontFamily: "KronaOne"
  },

  link : {
    maxWidth: '50%',
    textAlign: 'center'
  },

  linkText: {
    fontSize: 13,
    color: '#1C62CA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    fontFamily: "KronaOne",
    textAlign: 'center'
  },

  error: {
    color: '#F00',
    width: '100%',
    fontSize: 13,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontFamily: "KronaOne"
  }
});

export default LoginScreen;