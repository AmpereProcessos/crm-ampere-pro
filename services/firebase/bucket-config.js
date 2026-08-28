import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const firebaseServiceAccount = {
	projectId: "sistemaampere",
	privateKey: process.env.FIREBASE_PRIVATE_KEY,
	clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

export default async function getBucket() {
	let sdkApp = getApps().find((app) => app.name === "SDK");
	if (!sdkApp) {
		sdkApp = initializeApp(
			{
				credential: cert(firebaseServiceAccount),
				storageBucket: "sistemaampere.appspot.com",
			},
			"SDK",
		);
	}

	return getStorage(sdkApp).bucket();
}
