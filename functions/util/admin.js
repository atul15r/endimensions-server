const admin = require("firebase-admin");
const key = require("./endimensions-hospital-firebase-adminsdk-994v6-03248a14d5.json");

admin.initializeApp({
	credential: admin.credential.cert(key),
	storageBucket: "endimensions-hospital.appspot.com",
	databaseURL: "https://endimensions-hospital-default-rtdb.firebaseio.com",
});

const db = admin.firestore();
const fbd = admin.database();

module.exports = { admin, db, fbd };
