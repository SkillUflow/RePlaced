import * as Location from 'expo-location';

// Function to get user location (and ask for location permission)
export async function getLocation() {

    // Checking for necessary permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return 'Permission to access location was denied';
    }

    let location = await Location.getCurrentPositionAsync({});

    return JSON.stringify(location);
}