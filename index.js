import express from "express";
import { firebase } from "./firebase-utils.js";
import BalanceApi from "./balance.js";
import UserApi from "./user.js";
import cookieParser from "cookie-parser";

const PORT = 3000;
firebase.initializeApp();
var app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/", function (request, response) {
  response.send("Hello World!");
});

app.get("/user", function (request, response) {});

new BalanceApi(app);
new UserApi(app);

app.listen(PORT, function () {
  console.log("Started application on port", PORT);
});