import {
  loginUserByEmail,
  getUserFromRequest,
  createEmailUser,
  logoutUser,
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
      response.send(user.toJSON());
    });

    app.get("/me", async function (request, response) {
      try {
        const user = await getUserFromRequest(request);
        response.send(user.toJSON());
      } catch (error) {
        response.send({ errorMessage: error.message });
      }
    });

    app.get("/logout", async function (request, response) {
      await logoutUser(request, response);
      response.send(200);
    });
  }
}
