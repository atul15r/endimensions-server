const { db } = require("../util/admin");
const { config } = require("../util/config");

const { validateSignupData, validateLoginData } = require("../util/validators");
const { dbRef } = require("../util/constants");

const firebase = require("firebase");
const { generateToken } = require("./token");
firebase.initializeApp(config);

// Signup user
exports.signup = (req, res) => {
	const { userType, email, userName, password } = req.body;

	const newUser = {
		userType,
		email,
		userName,
	};

	const { valid, errors } = validateSignupData(req.body);

	if (!valid) return res.status(400).json(errors);

	let userId;
	db.doc(`/${dbRef.users}/${newUser.email}`)
		.get()
		.then(doc => {
			if (doc.exists) {
				return res.status(400).json({ message: "this email is already taken" });
			} else {
				return firebase
					.auth()
					.createUserWithEmailAndPassword(newUser.email, password);
			}
		})
		.then(data => {
			userId = data.user.uid;
			return userId;
		})
		.then(async () => {
			const userCredentials = {
				...newUser,
				createdAt: new Date().toISOString(),
				userId,
			};

			await db.doc(`/users/${newUser.email}`).set(userCredentials);
			return userCredentials;
		})
		.then(userData => {
			const token = generateToken(userData);
			return res.status(201).json({ token, ...userData });
		})
		.catch(err => {
			console.error(err);
			if (err.code === "auth/email-already-in-use") {
				return res.status(400).json({ message: "Email is already is use" });
			} else {
				return res
					.status(500)
					.json({ message: "Something went wrong, please try again" });
			}
		});
};

// Log user in
exports.login = async (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password,
	};

	const { valid, errors } = validateLoginData(user);

	if (!valid) return res.status(400).json(errors);

	const response = {};

	try {
		let userData = await db
			.collection(dbRef.users)
			.where("email", "==", req.body.email)
			.limit(1)
			.get();

		if (!userData.empty) {
			const token = generateToken(userData.docs[0].data());
			response.user = { ...userData.docs[0].data(), token };
			return res.status(200).json(response);
		}
	} catch (err) {
		console.error(err);
		// auth/wrong-password
		// auth/user-not-found
		return res
			.status(403)
			.json({ general: "Wrong credentials, please try again" });
	}
};
