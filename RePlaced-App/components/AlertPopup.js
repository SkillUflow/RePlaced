import { Image, Pressable, Text, View, StyleSheet } from 'react-native';
import { useGlobalContext } from './GlobalContext';

import closeImg from "../assets/buttons/close.png";

let typeColors = {
    success: 'green',
    warning: 'orange',
    error:   'red',
}

const AlertPopup = () => {

    const { alertOpened, setAlertOpened, alertMessage } = useGlobalContext();

    if (alertOpened) {
        setTimeout(() => setAlertOpened(false), 9000);
    }

    let alertColor = typeColors[alertMessage.type];

    return (
        <View style={styles.container}>
            <View style={[styles.errorContainer, {backgroundColor: alertColor}, {display: alertOpened ? 'flex' : 'none'}]}>
                <Text style={styles.messageText}>{alertMessage.message}</Text>

                <Pressable style={styles.crossPress} onPress={() => { setAlertOpened(false) }}>
                    <Image source={closeImg} style={styles.cross} />
                </Pressable>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%', 
        position: 'absolute', 
        top: 40, 
        flex: 1, 
        alignItems: "center"
    },

    errorContainer: { 
        width: '85%', 
        padding: 10, 
        paddingLeft: 10,
        borderRadius: 8, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between'
    },

    messageText: { 
        color: "white", 
        textAlign: "left",  
        fontSize: 20, 
        fontFamily:'Kanit'
    },

    crossPress: { 
        height: '100%', 
        width: 20 
    },

    cross: {
        height: 20,
        width: 20
    }
})

export default AlertPopup;