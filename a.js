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

  constructor(name, email, balance, deposits, withdraws, authUid) {
    this.name = name;
    this.email = email;
    this.deposits = deposits;
    this.withdraws = withdraws;
    this.balance = balance;
    this.authUid = authUid;
  }

  toJSON() {
    return {
      email: this.email,
      name: this.name,
      balance: this.balance,
      authUid: this.authUid,
      deposits: this.deposits,
      withdraws: this.withdraws,
    };
  }

  async deposit(amount) {
    const newBalance = this.balance + amount;

    const transactions = this.updateTransactionArray(
      amount,
      newBalance,
      this.deposits
    );

    this.deposits = transactions;
    this.balance = newBalance;

    await this.update();
  }

  async withdraw(amount) {
    if (amount > this.balance) {
      throw new Error("Withdraw Amount Larger than Balance");
    }

    const newBalance = this.balance - amount;

    const transactions = this.updateTransactionArray(
      amount,
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
      amount: amount.toFixed(2),
      balance: newBalance.toFixed(2),
    });

    return transactions;
  }
}
