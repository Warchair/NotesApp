import { doc, setDoc } from "firebase/firestore"
import { firestore } from "./firebase.config"

const SaveData = async (data) => {
	await setDoc(doc(firestore, "notes", `${Date.now()}`), data, {
		merge: true,
	})
}

export { SaveData }
