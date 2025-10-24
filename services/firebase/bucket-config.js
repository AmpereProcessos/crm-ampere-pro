import admin from "firebase-admin";
// import { firebaseServiceAccount } from "../utils/constants";
const firebaseServiceAccount = {
	type: "service_account",
	project_id: "sistemaampere",
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY,
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: "https://accounts.google.com/o/oauth2/auth",
	token_uri: "https://oauth2.googleapis.com/token",
	auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
	client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
	universe_domain: "googleapis.com",
};
export default async function getBucket() {
	var sdkApp = admin.apps.find((app) => app.name == "SDK");
	if (!sdkApp) {
		sdkApp = admin.initializeApp(
			{
				credential: admin.credential.cert(firebaseServiceAccount),
				storageBucket: "sistemaampere.appspot.com",
			},
			"SDK",
		);
	}

	const bucket = sdkApp.storage().bucket();
	return bucket;
}
