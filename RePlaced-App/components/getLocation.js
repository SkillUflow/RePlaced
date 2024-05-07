import * as Location from 'expo-location';

// Fonction asynchrone qui retoure un objet Json, contendant des informations sur la position de l'appareil
export async function getLocation() {
  
    // On vérifie qu'on a les permissions nécessaires de l'utilisateur.
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // A revoir, pour intégrer cette erreur proprement dans l'interface.
      return 'Permission to access location was denied';
    }

    let location = await Location.getCurrentPositionAsync({});
    // Génial, elle est asynchrone.
    return JSON.stringify(location);
  }