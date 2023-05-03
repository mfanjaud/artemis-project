const mongoose = require("mongoose");

const MONGO_URL =
  "mongodb+srv://artemis-api:XIbuYuq5zVt7VewT@artemiscluster.h8akgzq.mongodb.net/artemis?retryWrites=true&w=majority";

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready!");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

module.exports = {
  mongoConnect,
};
