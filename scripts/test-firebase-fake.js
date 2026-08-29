import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALFV0IqDjwDNc_MFyvpEme7uRnYiRgIpU",
  authDomain: "fake-project-id.firebaseapp.com",
  projectId: "fake-project-id",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  try {
    console.log("Testing connection to fake project...");
    await setDoc(doc(db, "cargos", "test"), { fake: true });
    console.log("Write successful! (Optimistic UI)");
    process.exit(0);
  } catch (err) {
    console.error("CONNECTION FAILED:", err);
    process.exit(1);
  }
}

testConnection();
