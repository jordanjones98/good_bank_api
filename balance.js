import { getUserFromRequest, updateUser } from "./user-utils.js";
import { format } from "date-fns";

export default class BalanceApi {
  app = null;
  constructor(app) {
    app.post("/deposit", async function (request, response) {
      const user = await getUserFromRequest(request, response);

      const amount = request.body.amount;
      const newBalance = user.balance - amount;

      const transactions = updateTransactionArray(
        user.deposits,
        amount,
        newBalance
      );

      user.deposits = transactions;
      user.balance = newBalance;

      await updateUser(user);

      response.send(user);
    });

    app.post("/withdraw", async function (request, response) {
      const user = await getUserFromRequest(request, response);

      const amount = request.body.amount;
      const newBalance = user.balance - amount;

      const transactions = updateTransactionArray(
        user.withdraws,
        amount,
        newBalance
      );

      user.withdraws = transactions;
      user.balance = newBalance;

      await updateUser(user);

      response.send(user);
    });

    const updateTransactionArray = (transactions, amount, newBalance) => {
      if (!transactions) {
        transactions = [];
      }

      transactions.push({
        date: format(new Date(), "MM/dd/yyyy 'at' h:mm a"),
        amount: amount.toFixed(2),
        balance: newBalance.toFixed(2),
      });

      return transactions;
    };
  }
}
