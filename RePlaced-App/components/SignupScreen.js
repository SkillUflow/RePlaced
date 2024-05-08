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


const SignupScreen = () => {

  // Variables used for inputs
  const [surname, setSurname]           = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get global variables
  const { sessionKey, setSessionKey, connModalVisible, setConnModalVisible, connMenu, setConnMenu, serverURL} = useGlobalContext();

  const signup = async () => {

    if(password.length < 5) {
      setErrorMessage("Error: The password must be at least 5 characters long")
    }

    else {
      try {
        const response = await fetch(serverURL + "/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            surname,
            email,
            password: hashPassword(password)
          }),
        });
    
        const resultat = await response.json();

        if(!resultat.response) {
          setErrorMessage('Error: ' + resultat.error);
        }

        else {
          setSessionKey(resultat.key);
          
          setModalVisible(false);
        }



      } catch (erreur) {
        setErrorMessage("Erreur :", erreur);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New account</Text>

      {errorMessage != "" ?
        <Text style={styles.error}>{errorMessage}</Text> : null
      }

      <Text style={styles.label}>Surname</Text>
      <TextInput 
        onChangeText={surname => setSurname(surname)}
        defaultValue={surname}
        autoComplete='username'
        autoCapitalize='words'
        style={styles.input}
        placeholder="Enter your surname..." 
      />
      <Text style={styles.label}>Email adress</Text>
      <TextInput 
        onChangeText={mail => setEmail(mail)}
        defaultValue={email}
        autoComplete='email'
        autoCapitalize='none'
        style={styles.input}
        placeholder="Enter your email adress..." 
      />

      <Text style={styles.label}>Password</Text>
      <TextInput 
        onChangeText={pass => setPassword(pass)}
        secureTextEntry
        defaultValue={password}
        autoComplete='current-password'
        autoCapitalize='none'
        style={styles.input} 
        placeholder="Enter your password..." 
      />

      <Pressable style={styles.submitBtn} onPress={signup}>
        <Text style={styles.submitText}>Sign up!</Text>
      </Pressable>

      <View style={styles.topContainer}>
        <Pressable style={styles.link} onPress={() => setConnModalVisible(false)}>
          <Text style={styles.linkText}>Back to map</Text>
        </Pressable>

        <Pressable style={styles.link} onPress={() => setConnMenu('login')}>
          <Text style={styles.linkText}>Sign in</Text>
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

export default SignupScreen;