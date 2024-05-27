import { Image, Pressable, Text, View, StyleSheet } from 'react-native';
import { useGlobalContext } from './GlobalContext';

let closeImg = 'https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/close.png?v=1715939489965';

let typeColors = {
    success: 'green',
    warning: 'orange',
    error:   'red',
}

/**
 * Calculates the area of a rectangle
 * @returns {View} - Popup window
 */
const AlertPopup = () => {

    const { alertOpened, setAlertOpened, alertMessage } = useGlobalContext();
    let timeOut;

    if (alertOpened) {
        if(timeOut) clearTimeout(timeOut);

        timeOut = setTimeout(() => setAlertOpened(false), 9000);
    }

    // get popup color by message type
    let alertColor = typeColors[alertMessage.type];

    return (
        <View style={styles.container}>
            <View style={[styles.errorContainer, {backgroundColor: alertColor}, {display: alertOpened ? 'flex' : 'none'}]}>
                <Text style={styles.messageText}>{alertMessage.message}</Text>

                <Pressable style={styles.crossPress} onPress={() => { setAlertOpened(false) }}>
                    <Image src={closeImg} style={styles.cross} />
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
        fontFamily:'Kanit',
        width: '85%'
    },

    crossPress: { 
        height: '100%',
        width: 20 
    },

    cross: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    }
})

export default AlertPopup;