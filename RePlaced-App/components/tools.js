async function bookPlace() {
  console.log("Pressed");

  try {
    // Get value in global env of app
    const value = await AsyncStorage.getItem('loginKey');

    // User logged in
    if (value !== null) {
      
    }

    // User not logged in
    else {
      openLoginModale();
    }
  } catch (e) {
    // error reading value
  }
}


module.exports = {
  bookPlace
}