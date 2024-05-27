import { View, Modal, StyleSheet, StatusBar } from "react-native";

// Import components
import LoginScreen  from './LoginScreen';
import SignupScreen from './SignupScreen';

import { useGlobalContext } from './GlobalContext';

const ConnectionModal = () => {

  const { connModalVisible, setConnModalVisible, connMenu, isNightMode } = useGlobalContext();

  const modalOpened = () => {

    // Status bar style
    StatusBar.setTranslucent(false);
    StatusBar.setBackgroundColor(isNightMode ? '#092145' : '#1C62CA');
    StatusBar.setBarStyle('light-content');

  }

  const closeModal = () => {

    // Status bar style
    StatusBar.setBarStyle(isNightMode ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);

    // Closing tab
    setConnModalVisible(false);

  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={connModalVisible}
      onRequestClose={closeModal}
      onShow={modalOpened}
      >
        <View style={[styles.modalView, {backgroundColor: isNightMode ? '#092145' : '#1C62CA'}]} onStartShouldSetResponder={() => true}>
          { 
            connMenu == 'login' ? 
            <LoginScreen closeModal={closeModal} ></LoginScreen> : 
            <SignupScreen closeModal={closeModal}></SignupScreen>
          }
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
