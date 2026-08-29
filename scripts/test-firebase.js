import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALFV0IqDjwDNc_MFyvpEme7uRnYiRgIpU",
  authDomain: "project-a9c284f8-6bca-440a-a0c.firebaseapp.com",
  projectId: "project-a9c284f8-6bca-440a-a0c",
  storageBucket: "project-a9c284f8-6bca-440a-a0c.firebasestorage.app",
  messagingSenderId: "887568501843",
  appId: "1:887568501843:web:e747db27d1f927cf8c4aa6",
  measurementId: "G-M0CMRMP06J"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  try {
    console.log("Testing connection by reading a document...");
    // getDoc must hit the server to know if it exists (or wait for offline cache, which we don't have here)
    const snapshot = await getDoc(doc(db, "cargos", "does_not_exist"));
    console.log("Read successful. Database exists and is accessible. Document exists?", snapshot.exists());
    process.exit(0);
  } catch (err) {
    console.error("CONNECTION FAILED:", err);
    process.exit(1);
  }
}

testConnection();
