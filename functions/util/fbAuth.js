const { getTokendata } = require("../handlers/token");
const { db } = require("./admin");

module.exports = async (req, res, next) => {
	let idToken;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer ")
	) {
		idToken = req.headers.authorization.split("Bearer ")[1];
	} else {
		console.error("No token found");
		return res.status(403).json({ error: "Unauthorized" });
	}
	try {
		let tokendata = getTokendata(idToken);
		req.user = tokendata;

		let userData = await db
			.collection("users")
			.where("userId", "==", tokendata.userId)
			.limit(1)
			.get();
		if (!userData.empty) {
			req.user.userId = userData.docs[0].data().userId;
			req.user.imageUrl = userData.docs[0].data().imageUrl;
			req.user.userType = userData.docs[0].data().userType;
			req.user.userName = userData.docs[0].data().userName;
			return next();
		}
	} catch (error) {
		console.error("Error while verifying token ", error);
		return res.status(403).json(error);
	}
};
