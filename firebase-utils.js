import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config.local.js";

class Firebase {
  db = null;
  app = null;

  getDb() {
    if (!this.db) {
      this.db = getFirestore(this.getApp());
    }

    return this.db;
  }

  getApp() {
    if (!this.app) {
      this.app = initializeApp(firebaseConfig);
    }

    return this.app;
  }

  initializeApp() {
    this.app = initializeApp(firebaseConfig);
  }
}

export const firebase = new Firebase();
