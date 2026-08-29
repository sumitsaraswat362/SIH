import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALFV0IqDjwDNc_MFyvpEme7uRnYiRgIpU",
  authDomain: "project-a9c284f8-6bca-440a-a0c.firebaseapp.com",
  projectId: "project-a9c284f8-6bca-440a-a0c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  try {
    const snapshot = await getDoc(doc(db, "cargos", "test-cargo-123"));
    if (snapshot.exists()) {
      console.log("DOCUMENT ACTUALLY EXISTS ON SERVER:", snapshot.data());
    } else {
      console.log("DOCUMENT DOES NOT EXIST ON SERVER!");
    }
    process.exit(0);
  } catch (err) {
    console.error("CONNECTION FAILED:", err);
    process.exit(1);
  }
}

testConnection();
