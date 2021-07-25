const { db } = require("../util/admin");
const { dbRef } = require("../util/constants");
const moment = require("moment");

exports.bookAppointment = (req, res, next) => {
	const appointmentData = {
		slot: req.body.slot,
		bookedFor: req.body.date,
		userName: req.user.userName,
		userId: req.user.userId,
		createdAt: new Date().toISOString(),
	};

	db.collection(dbRef.appointment)
		.doc()
		.set(appointmentData)
		.then(doc => {
			const resData = appointmentData;
			resData.appointmentId = doc.id;
			if (resData) return res.status(200).json(resData);
		})
		.catch(err => {
			res.status(500).json({ message: "something went wrong" });
			console.error(err);
		});
};

exports.fetchAppointment = (req, res) => {
	if (req.user.userType === "member") {
		db.collection(dbRef.appointment)
			.orderBy("createdAt", "desc")
			.where("userId", "==", req.user.userId)
			.get()
			.then(data => {
				let appointments = [];
				data.forEach(doc => {
					appointments.push({
						appointmentId: doc.id,
						slot: doc.data().slot,
						bookedFor: doc.data().bookedFor,
						createdAt: doc.data().createdAt,
					});
				});

				return res.status(200).json(appointments);
			})
			.catch(err => {
				console.error(err);
				res.status(500).json({ error: err.code });
			});
	} else {
		db.collection(dbRef.appointment)
			.orderBy("createdAt", "desc")
			.get()
			.then(data => {
				let appointments = [];

				data.forEach(doc => {
					appointments.push({
						appointmentId: doc.id,
						slot: doc.data().slot,
						bookedFor: doc.data().bookedFor,
						userId: doc.data().userId,
						userName: doc.data().userName,
						createdAt: doc.data().createdAt,
					});
				});

				return res.status(200).json(appointments);
			})
			.catch(err => {
				console.error(err);
				res.status(500).json({ message: err.code });
			});
	}
};

exports.fetchFilledSlots = (req, res, next) => {
	db.collection(dbRef.appointment)
		.orderBy("createdAt", "desc")
		.where("bookedFor", "==", req.query.date)
		.get()
		.then(data => {
			let appointments = [];

			data.forEach(doc => {
				appointments.push(doc.data());
			});

			return res.status(200).json(appointments);
		})
		.catch(err => {
			res.status(500).json({ message: "something went wrong" });
			console.error(err);
		});
};
