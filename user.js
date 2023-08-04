import {
  loginUserByEmail,
  getUserFromRequest,
  createEmailUser,
} from "./user-utils.js";

export default class UserApi {
  app = null;
  constructor(app) {
    app.post("/login", async function (request, response) {
      const email = request.body.email;
      const password = request.body.password;

      const user = await loginUserByEmail(email, password, response);
      response.send(user);
    });

    app.post("/createaccount", async function (request, response) {
      const email = request.body.email;
      const password = request.body.password;
      const name = request.body.name;

      const user = await createEmailUser(email, password, name, response);
      response.send(user);
    });

    app.get("/me", async function (request, response) {
      const user = await getUserFromRequest(request);
      response.send(user);
    });
  }
}
