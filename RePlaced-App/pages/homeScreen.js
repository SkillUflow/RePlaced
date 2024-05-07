import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen. Bon courage Aymeric, tu vas dead ça</Text>
      <Pressable onPress={() => navigation.navigate('MainMap')} style={styles.center_btn}>
        <Image source={require('../assets/buttons/center_map.png')} style={styles.center_btn_img}/>
      </Pressable>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  center_btn: {
    width: 10,
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  center_btn_img: {
    height: 80,
    width: 80,
  }
});
