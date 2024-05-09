import { useState } from "react";
import { Modal,Text, View, Pressable, StyleSheet,StatusBar,Image,TextInput, Button } from "react-native";
import { useGlobalContext } from './GlobalContext';
import closeImg from "../assets/buttons/close.png"


const SettingsModal = ({modaleVisible,setSettingsModaleVisible}) => {

  const { setConnModalVisible,serverURL,setServerURL,} = useGlobalContext();
  
  const [newTextURL, setNewTextURL] = useState(serverURL);
  console.log(modaleVisible);
  

  const saveURL = ()=>{
    setServerURL(newTextURL);
    console.log("saved");
    console.log(serverURL);
  }

  const closeModal=()=>{
    setSettingsModaleVisible(false)
    StatusBar.hidden=false;
  }

  return(
    <Modal
    animationType="slide"
    transparent={true}
    visible={modaleVisible}
    onRequestClose={() => {
      setSettingsModaleVisible(!modaleVisible);
    }}>
    
      <View style={styles.modalView} onStartShouldSetResponder={() => true}>
          <Pressable style={styles.closeBtn}  onPress={() => {closeModal()}}>
              <Image source={closeImg} style={styles.closeImg}/>
          </Pressable>
          <Text style={styles.title}>Paramètres</Text>
          
          <View>
            <Text>Devloppement</Text>
            <View>
              <Text>Ip du serveur:</Text>
              <TextInput
                style={{height: 40}}
                placeholder="Entrez la nouvelle IP"
                onChangeText={newTextURL => setNewTextURL(newTextURL)}
                defaultValue={newTextURL}
              />
              <Button title="Valider" onPress={()=>saveURL()}/>

            </View>

            <Button title="seDeconnecter"/>
          </View>
          
      </View>
    
  </Modal>
  )
}
const styles = StyleSheet.create({
  modalView: {
    flex:1,
    width:"100%",
    marginTop:0,
    backgroundColor: 'white',
    padding: 35,

  },
  title:{
    fontSize:30,
    fontWeight:"bold"
  },
  text:{
    fontSize:30,
    fontWeight:"300"
  },

  closeBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    height: 30,
    width: 30,
  },
  closeImg: {
    height: "100%",
    width: "100%",
  },

  
});


export default SettingsModal;