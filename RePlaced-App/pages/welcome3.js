import { View, Text, StyleSheet, Image, Pressable } from 'react-native';


let image = "https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/imageThree.png?v=1715939526792"
let circle = "https://cdn.glitch.global/81fad3f2-5dc3-41a6-a0bc-4d8cfa9dfccc/circle.png?v=1715939489644";



const Welcome3 = ({ navigation }) => {

  return (

    <View style={styles.container}>

      <Image src={image} style={styles.mainImage} />
      <Text style={[styles.text, styles.centerText]}>... et réservez-là !</Text>
      <View style={styles.circleContainer}>
        <Pressable style={styles.smallBtnContainer} onPress={() => navigation.navigate('Welcome1')}>
          <Image style={styles.circle} src={circle}></Image>
        </Pressable>
        <Pressable style={styles.smallBtnContainer} onPress={() => navigation.navigate('Welcome2')}>
          <Image style={styles.circle} src={circle}></Image>
        </Pressable>
        <Pressable style={styles.bigBtnContainer} onPress={() => navigation.navigate('Welcome3')}>
          <Image style={styles.circle} src={circle}></Image>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1C62CA",
    height: '100%'
  },

  mainImage: {
    width: '70%',
    height: '60%',
    resizeMode: 'contain'
  },
  text: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontFamily: "KronaOne"
  },
  centerText: {
    width: "80%"
  },
  smallBtnContainer: {
    width: 20,
    height: 20,
  },
  bigBtnContainer: {
    width: 28,
    height: 28,
  },
  circle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },

  circleContainer: {
    flexDirection: 'row',
    width: '25%',
    alignItems: 'center',
    height: 80,
    marginBottom: 30,
    justifyContent: 'space-between'
  }
});

export default Welcome3;