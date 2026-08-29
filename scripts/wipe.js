import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALFV0IqDjwDNc_MFyvpEme7uRnYiRgIpU",
  authDomain: "project-a9c284f8-6bca-440a-a0c.firebaseapp.com",
  projectId: "project-a9c284f8-6bca-440a-a0c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function wipeAndReset() {
  try {
    console.log("Fetching cargos...");
    const cargosSnapshot = await getDocs(collection(db, "cargos"));
    for (const d of cargosSnapshot.docs) {
      console.log("Deleting cargo:", d.id);
      await deleteDoc(d.ref);
    }
    
    console.log("Fetching bids...");
    const bidsSnapshot = await getDocs(collection(db, "bids"));
    for (const d of bidsSnapshot.docs) {
      console.log("Deleting bid:", d.id);
      await deleteDoc(d.ref);
    }
    
    console.log("CLEANUP SUCCESSFUL");
    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err);
    process.exit(1);
  }
}

wipeAndReset();
