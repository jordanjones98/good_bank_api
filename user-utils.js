import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { firebase } from "./firebase-utils.js";
import { isBefore, addHours } from "date-fns";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import User from "./User.js";

const SESSION_COLLECTION_NAME = "sessions";
export const USER_COLLECTION_NAME = "users";
const SESSION_LENGTH_HOURS = 6;
const COOKIE_NAME = "authToken";
export async function getUserFromRequest(request) {
  const isExpired = (expireDate) => {
    return isBefore(new Date(expireDate), new Date());
  };

  let token;

  token = request.get("Authorization");

  if (!token) {
    token = request.cookies[COOKIE_NAME];
  }

  if (!token) {
    throw Error("Error Getting User");
  }

  const db = firebase.getDb();

  const sessionDocRef = doc(db, SESSION_COLLECTION_NAME, token);
  const sessionDocSnap = await getDoc(sessionDocRef);

  if (!sessionDocSnap.exists()) {
    console.log("session not found");
    throw Error("Error Getting User");
  }

  const data = sessionDocSnap.data();

  if (isExpired(data.expireAt)) {
    console.log("user expired");
    throw Error("Error Getting User");
  }

  const userDocRef = doc(db, USER_COLLECTION_NAME, data.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    console.log("user not found");
    throw Error("Error Getting User");
  }

  const user = await getUserByUid(data.uid);

  return user;
}

export async function createEmailUser(email, password, name, response) {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const authUser = userCredential.user;
    const balance = 0;

    await createUserSession(authUser.uid, authUser.accessToken, response);

    const user = new User(name, email, 0, [], [], authUser.uid);
    user.token = authUser.accessToken;

    await user.update();

    return user;
  } catch (error) {
    console.log("Error logging in user", error.code, error.message);
    throw error;
  }
}

export async function loginUserByEmail(email, password, response) {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const authUser = userCredential.user;

    const user = await getUserByUid(authUser.uid);
    await createUserSession(authUser.uid, authUser.accessToken, response);

    user.token = authUser.accessToken;

    return user;
  } catch (error) {
    console.log("Error logging in user", error.code, error.message);
    throw error;
  }
}

async function getUserByUid(uid) {
  const db = firebase.getDb();
  const docRef = doc(db, USER_COLLECTION_NAME, uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("User not found");
  }

  const user = docSnap.data();

  return new User(
    user.name,
    user.email,
    user.balance,
    user.deposits,
    user.withdraws,
    user.authUid
  );
}

async function createUserSession(uid, token, response) {
  const db = firebase.getDb();
  const expireAt = addHours(new Date(), SESSION_LENGTH_HOURS).toISOString();

  // This should set cookies
  response.cookie(COOKIE_NAME, token, { maxAge: 900000, httpOnly: true });

  try {
    const sessionDoc = doc(db, SESSION_COLLECTION_NAME, token);

    await setDoc(sessionDoc, { uid, expireAt });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function removeUserSession(token) {
  const sessionDoc = doc(db, SESSION_COLLECTION_NAME, token);
  await deleteDoc(sessionDoc);
  return;
}

export async function logoutUser(request, response) {
  const token = request.cookies[COOKIE_NAME];
  response.clearCookie(COOKIE_NAME);
  return;
}
