const functions = require("firebase-functions");
const FBAuth = require("./util/fbAuth");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
// adding Helmet to enhance your API's security
app.use(helmet());

// using express to parse JSON bodies into JS objects
app.use(express.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

const {
	bookAppointment,
	fetchAppointment,
	fetchFilledSlots,
} = require("./handlers/booking");
const { signup, login } = require("./handlers/users");

var server = app.listen(3001, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("app listening at", port, host);
});

//users routes
app.post("/signup", signup);
app.post("/login", login);

app.post("/appointments", FBAuth, bookAppointment);
app.get("/appointments", FBAuth, fetchAppointment);
app.get("/filledSlots", FBAuth, fetchFilledSlots);

exports.api = functions.region("us-central1").https.onRequest(app);
