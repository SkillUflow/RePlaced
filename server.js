import express from 'express';
import * as fs from 'fs';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import { python } from 'pythonia';

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = path.join(__dirname, './RePlaced-Website');


const app = express();
const port = 3000;
const dbPath = "./db.json";
const expireTime = 1000 * 30; // One day

app.use(bodyParser.json());
app.use(express.static(publicPath));



function getDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 4));
}


async function fetchParkings() {

  try {

    let response = await fetch("https://opendata.lillemetropole.fr/api/explore/v2.1/catalog/datasets/disponibilite-parkings/records?limit=100", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    let resultat = await response.json();

    let db = getDB();

    resultat.results.forEach(place => {

      if(place.etat == 'FERME') return;

      let long = place.geometry.geometry.coordinates[0];
      let lat  = place.geometry.geometry.coordinates[1];

      let placeInDB = db.pinList.find(pin => pin.lat == lat && pin.long == long);

      if(placeInDB) {
        placeInDB.numPlaces = place.max;
        placeInDB.numBooked = place.max - place.dispo;
      }

      else {
        db.pinList.push({
          lat,
          long,
          numPlaces: place.max,
          numBooked: place.max - place.dispo,
          booked: [],
          placeOrigin: "api"
        })
      }
    })

    response = await fetch("https://portail-api-data.montpellier3m.fr/offstreetparking?limit=1000", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    resultat = await response.json();


    resultat.forEach(place => {

      if(place.status.value != 'Open') return;

      let long = place.location.value.coordinates[0];
      let lat  = place.location.value.coordinates[1];

      let placeInDB = db.pinList.find(pin => pin.lat == lat && pin.long == long);

      if(placeInDB) {
        placeInDB.numPlaces = place.totalSpotNumber.value;
        placeInDB.numBooked = place.totalSpotNumber.value - place.availableSpotNumber.value;
      }

      else {
        db.pinList.push({
          lat,
          long,
          numPlaces: place.totalSpotNumber.value,
          numBooked: place.totalSpotNumber.value - place.availableSpotNumber.value,
          booked: [],
          placeOrigin: "api"
        })
      }
    })

    response = await fetch("https://data.ampmetropole.fr/api/explore/v2.1/catalog/datasets/disponibilites-des-places-de-parkings/records?limit=100", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })


    resultat = await response.json();
    resultat.results.forEach(place => {

      if(place.tempsreel == 'False' || place.voitureplacesdisponibles == 0) return;

      let long = place.longitude;
      let lat  = place.latitude;

      let placeInDB = db.pinList.find(pin => pin.lat == lat && pin.long == long);

      if(placeInDB) {
        placeInDB.numPlaces = place.voitureplacescapacite;
        placeInDB.numBooked = place.voitureplacescapacite - place.voitureplacesdisponibles;
      }

      else {
        db.pinList.push({
          lat,
          long,
          numPlaces: place.voitureplacescapacite,
          numBooked: place.voitureplacescapacite - place.voitureplacesdisponibles,
          booked: [],
          placeOrigin: "api"
        })
      }
    })

    saveDB(db);
  }

  catch(e) {
    console.error("ERROR: Failed while fetching parkings...");
  }
}


setInterval(fetchParkings, 60 * 1000)



app.post('/login', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.email == req.body.email);

  if(!user) {
    return res.json({response: false, error: 'Adresse email incorrect'});
  }

  if(user.password != req.body.password) {
    return res.json({response: false, error: 'Mot de passe incorrect'});
  }


  let randomKey = "";
  let randomKeyLength = 20;
  let hexaChar = "0123456789ABCDEF";
  
  for(let i = 0; i < randomKeyLength; ++i) {
    let char = hexaChar[Math.round(Math.random() * (hexaChar.length - 1))];

    if(Math.round(Math.random() * 100) % 2 == 0) {
      randomKey += char.toLowerCase();
    }
    else {
      randomKey += char;
    }
  }

  user.session.key    = randomKey;
  user.session.expire = new Date().getTime() + expireTime;

  saveDB(db);

  return res.json({response: 'ok', key: randomKey});
})

app.post('/signup', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.email == req.body.email);
  let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


  if(req.body.surname.length < 2) {
    return res.json({response: false, error: 'Le prénom doit contenir au moins 2 caractères'});
  }
  
  else if(user) {
    return res.json({response: false, error: 'Cet adresse email est déjà utilisé ! Essayez de vous connecter'});
  }

  else if(req.body.email.length < 5 || !emailReg.test(req.body.email)) {
    return res.json({response: false, error: 'Email invalide'});
  }

  let randomKey = "";
  let randomKeyLength = 20;
  let hexaChar = "0123456789ABCDEF";
  
  for(let i = 0; i < randomKeyLength; ++i) {
    let char = hexaChar[Math.round(Math.random() * (hexaChar.length - 1))];

    if(Math.round(Math.random() * 100) % 2 == 0) {
      randomKey += char.toLowerCase();
    }
    else {
      randomKey += char;
    }
  }

  user = {
    email: req.body.email,
    surname: req.body.surname,
    password: req.body.password,
    session: {
      key: randomKey,
      expire: new Date().getTime() + expireTime
    }
  }

  db.users.push(user);

  saveDB(db);

  return res.json({response: 'ok', key: randomKey});
})


app.post('/logout', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.session.key == req.body.sessionKey);

  if(!user) return res.json({response: false});

  user.session = {};

  saveDB(db);

  return res.json({response: true});
})


app.post('/pinList', (req, res) => {

  let db = getDB();

  let user = getDB().users.find(user => user.session.key == req.body.sessionKey);


  db.pinList.forEach(pin => {

    pin['booked'] = pin['booked'].filter(bookerKey => {

      let booker = db.users.find(user => user.session.key == bookerKey);

      if(!booker || booker.session.expire < new Date().getTime()) return false;

      return true;
    })
  })

  saveDB(db);

  res.json({db: db.pinList});
})

app.post('/isLogged', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.session.key == req.body.sessionKey);


  if(!user || user.session.expire <= new Date().getTime()) {
    return res.json({response: false});
  }

  // If user is logged in, we continue their session
  user.session.expire = new Date().getTime() + expireTime;

  // Save datas in DB
  saveDB(db);

  return res.json({response: true, surname: user.surname});
})


app.post('/deleteAccount', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.session.key == req.body.sessionKey);


  if(!user || user.session.expire <= new Date().getTime()) {
    return res.json({response: false});
  }
  
  db.users.splice(db.users.indexOf(user), 1);

  // Save datas in DB
  saveDB(db);

  return res.json({response: true});
})


app.post('/bookPlace', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.session.key == req.body.sessionKey);
  let pin = db.pinList.find(pin => pin.lat == req.body.lat && pin.long == req.body.long);

  if(!user || user.session.expire <= new Date().getTime() || !pin) {
    return res.json({response: false});
  }

  let previousPin = db.pinList.find(pin => pin.booked == user.session.key);

  if(previousPin) {
    previousPin.booked.splice(previousPin.booked.indexOf(user.session.key), 1);
  }
  
  user.session.expire = new Date().getTime() + expireTime;
  pin.booked.push(user.session.key);
  
  // Save datas in DB
  saveDB(db);

  return res.json({response: true});
})

app.post('/unbookPlace', (req, res) => {

  let db = getDB();
  let user = db.users.find(user => user.session.key == req.body.sessionKey);
  let pin = db.pinList.find(pin => pin.lat == req.body.lat && pin.long == req.body.long);


  if(!user || user.session.expire <= new Date().getTime() || !pin) {
    return res.json({response: false});
  }
  
  user.session.expire = new Date().getTime() + expireTime;

  pin['booked'] = pin['booked'].filter(bookerKey => {
    let booker = db.users.find(user => user.session.key == bookerKey);

    if(!booker || bookerKey == user.session.key || booker.session.expire < new Date().getTime()) return false;

    return true;
  })

  // Save datas in DB
  saveDB(db);

  return res.json({response: true});
})



app.get('/tryPython', async (req, res) => {

  const programm = await python("./OCR/place_counter.py");  
  python.exit();

  res.send('It works!!! DAMN BRO')

  let ocrDB = JSON.parse(fs.readFileSync('./OCR/ocrDB.json'));
  let db = getDB();

  ocrDB.pinList.forEach(pin => {

    let pinn = db.pinList.find(pinn => pinn.lat == pin.lat && pinn.long == pin.long);
    
    if(!pinn) { 
      db.pinList.push({
        lat: pin.lat,
        long: pin.long,
        numPlaces: pin.numPlaces,
        numBooked: pin.numBooked,
        booked: [],
        placeOrigin: "ocr"
      })
    }

    else {
      pinn.numPlaces = pin.numPlaces;
      pinn.numBooked = pin.numBooked;
    }

  })

  saveDB(db);

})


app.listen(port, () => {
  console.log(`RePlaced server launched !`)
  console.log(`Listening on port ${port}...`);


  fetchParkings();
})