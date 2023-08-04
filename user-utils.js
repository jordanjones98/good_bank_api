import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebase } from "./firebase-utils.js";
import { isBefore, addHours } from "date-fns";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const SESSION_COLLECTION_NAME = "sessions";
const USER_COLLECTION_NAME = "users";
const SESSION_LENGTH_HOURS = 6;
const COOKIE_NAME = "authToken";
export async function getUserFromRequest(request) {
  const isExpired = (expireDate) => {
    return isBefore(new Date(expireDate), new Date());
  };

  const token = request.cookies[COOKIE_NAME];

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

  return docSnap.data();
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

export async function updateUser(user) {
  const db = firebase.getDb();
  try {
    const userDoc = doc(db, USER_COLLECTION_NAME, user.authUid);
    await setDoc(userDoc, user);

    return user;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
