import React, { Component } from "react"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
	apiKey: "AIzaSyBPpUtTNyjXN814_iBfuyYQHBdWgxEsalI",
	authDomain: "reactnotesapp-965c4.firebaseapp.com",
	projectId: "reactnotesapp-965c4",
	storageBucket: "reactnotesapp-965c4.appspot.com",
	messagingSenderId: "651247152956",
	appId: "1:651247152956:web:1054d5e57316a67adab839",
}

const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)
const storage = getStorage(app)

export { app, firestore, storage }
