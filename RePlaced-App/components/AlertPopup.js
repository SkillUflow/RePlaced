import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useGlobalContext } from './GlobalContext';

import closeImg from "../assets/buttons/close.png"

const AlertPopup = () => {

    const { alertOpened, setAlertOpened, alertMessage } = useGlobalContext();

    if (alertOpened) {
        display = "flex"
    } else {
        display = "none"
    }

    let typeColors = {
        success: 'green',
        warning: 'orange',
        error:   'red',
    }

    let alertColor = typeColors[alertMessage.type];

    return (
        <View style={{ width: '100%', position: 'absolute', bottom: 16, flex: 1, alignItems: "center", display: display }}>
            <View style={{ width: '85%', padding: 5, paddingLeft: 10, backgroundColor: alertColor, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: "white", textAlign: "center" }}>{alertMessage.message}</Text>

                <Pressable style={{ right: 0, height: 30, width: 30 }} onPress={() => { setAlertOpened(false) }}>
                    <Image source={closeImg} style={{ height: "100%", width: "100%" }} />
                </Pressable>
            </View>
        </View>
    )
}

export default AlertPopup;