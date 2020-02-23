const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
if (fs.existsSync(path.join(__dirname, "/.env"))) {
  dotenv.config();
} else {
  console.error("ERROR: Missing .env file, reference .env.example");
  process.exit(1);
}

const http = require("http");
const app = require("./backendapp.js");

const server = http.createServer(app);
server.listen(process.env.PORT, process.env.HOST, () => {
  console.log("Server started on " + process.env.HOST + ":" + process.env.PORT);
});
