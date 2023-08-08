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

      try {
        const user = await loginUserByEmail(email, password, response);
        response.send(user.toJSON(true));
      } catch (error) {
        response.status(500);
        response.send({ error: true, errorMessage: error.message });
      }
    });

    app.post("/createaccount", async function (request, response) {
      const email = request.body.email;
      const password = request.body.password;
      const name = request.body.name;

      try {
        const user = await createEmailUser(email, password, name, response);
        response.send(user.toJSON(true));
      } catch (error) {
        response.send({ error: true, errorMessage: error.message });
      }
    });

    app.get("/me", async function (request, response) {
      try {
        const user = await getUserFromRequest(request);
        response.send(user.toJSON(true));
      } catch (error) {
        response.send({ error: true, errorMessage: error.message });
      }
    });

    app.get("/logout", async function (request, response) {
      try {
        await logoutUser(request, response);
        response.send(200);
      } catch (error) {
        response.send({ error: true, errorMessage: error.message });
      }
    });
  }
}
