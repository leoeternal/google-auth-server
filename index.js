const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT_LOCAL;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));

require("./connection/db");
const UserRouter = require("./routers/UserRoute");
const CityRouter = require("./routers/CityRoute");

app.use(UserRouter);
app.use(CityRouter);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
