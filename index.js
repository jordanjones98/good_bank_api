import express from "express";
import { firebase } from "./firebase-utils.js";
import BalanceApi from "./balance.js";
import UserApi from "./user-routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const PORT = process.env.PORT || 4000;
firebase.initializeApp();
var app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.get("/", function (request, response) {
  response.send("Hello World!");
});

app.get("/user", function (request, response) {});

new BalanceApi(app);
new UserApi(app);

app.listen(PORT, function () {
  console.log("Started application on port", PORT);
});
