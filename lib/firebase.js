import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyC4pmekt-Tuj4TJmkNbmEpVlzoOMX8cfr4",
	authDomain: "miqat-bd033.firebaseapp.com",
	projectId: "miqat-bd033",
	storageBucket: "miqat-bd033.firebasestorage.app",
	messagingSenderId: "806989034935",
	appId: "1:806989034935:web:279bcb3b899a8192272432",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

