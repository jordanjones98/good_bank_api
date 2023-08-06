import { format } from "date-fns";
import { firebase } from "./firebase-utils.js";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { USER_COLLECTION_NAME } from "./user-utils.js";

export default class User {
  email;
  name;
  deposits;
  withdraws;
  balance;
  authUid;
  token;

  constructor(name, email, balance, deposits, withdraws, authUid) {
    this.name = name;
    this.email = email;
    this.deposits = deposits;
    this.withdraws = withdraws;
    this.balance = balance;
    this.authUid = authUid;
  }

  toJSON(withToken = false) {
    const user = {
      email: this.email,
      name: this.name,
      balance: this.balance,
      authUid: this.authUid,
      deposits: this.deposits,
      withdraws: this.withdraws,
    };

    if (withToken) {
      user.token = this.token;
    }

    return user;
  }

  async deposit(amount) {
    const cleanAmount = +parseFloat(amount).toFixed(2);

    const newBalance = this.balance + cleanAmount;

    const transactions = this.updateTransactionArray(
      cleanAmount,
      newBalance,
      this.deposits
    );

    this.deposits = transactions;
    this.balance = newBalance;

    await this.update();
  }

  async withdraw(amount) {
    const cleanAmount = +parseFloat(amount).toFixed(2);

    if (amount > this.balance) {
      throw new Error("Withdraw Amount Larger than Balance");
    }

    const newBalance = +parseFloat(this.balance - cleanAmount).toFixed(2);

    const transactions = this.updateTransactionArray(
      cleanAmount,
      newBalance,
      this.withdraws
    );

    this.withdraws = transactions;
    this.balance = newBalance;

    await this.update();
  }

  async update() {
    const db = firebase.getDb();
    try {
      const userDoc = doc(db, USER_COLLECTION_NAME, this.authUid);
      await setDoc(userDoc, this.toJSON());
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  updateTransactionArray(amount, newBalance, transactions) {
    if (!transactions) {
      transactions = [];
    }

    transactions.push({
      date: format(new Date(), "MM/dd/yyyy 'at' h:mm a"),
      amount: parseFloat(amount).toFixed(2),
      balance: newBalance,
    });

    return transactions;
  }
}
