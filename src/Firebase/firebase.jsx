import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User Info:", result.user);
        return result.user;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
};

const logout = async () => {
    try {
        await signOut(auth);
        console.log("User Signed Out");
    } catch (error) {
        console.error("Sign-Out Error:", error);
    }
};

export { auth, signInWithGoogle, logout };
