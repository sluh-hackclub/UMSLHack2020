const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
// if (fs.existsSync(path.join(__dirname, '/.env'))) {
//   dotenv.config();
// } else {
//   console.error('ERROR: Missing .env file, reference .env.example');
//   process.exit(1);
// }

const http = require("http");
const app = require("./backendapp.js");

const server = http.createServer(app);
server.listen(3000, "127.0.0.1", () => {
  console.log("Server started on " + +":" + process.env.PORT);
});
