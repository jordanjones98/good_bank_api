import { getUserFromRequest } from "./user-utils.js";
import { format } from "date-fns";

export default class BalanceApi {
  app = null;
  constructor(app) {
    app.post("/deposit", async function (request, response) {
      const user = await getUserFromRequest(request, response);

      const amount = request.body.amount;

      try {
        await user.deposit(amount);
        response.send(user.toJSON());
      } catch (error) {
        response.send({ errorMessage: error.message });
      }
    });

    app.post("/withdraw", async function (request, response) {
      const user = await getUserFromRequest(request, response);

      const amount = request.body.amount;

      try {
        await user.withdraw(amount);
        response.send(user.toJSON());
      } catch (error) {
        response.send({ errorMessage: error.message });
      }
    });
  }
}
