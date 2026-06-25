const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 3000;
const standaloneServerPath = path.join(__dirname, ".next", "standalone", "server.js");

if (fs.existsSync(standaloneServerPath)) {
  require(standaloneServerPath);
} else {
  const http = require("http");
  const next = require("next");
  const app = next({ dev: false });
  const handle = app.getRequestHandler();

  app
    .prepare()
    .then(() => {
      http
        .createServer((req, res) => {
          handle(req, res);
        })
        .listen(port, () => {
          console.log(`ndambi.org memorial app listening on port ${port}`);
        });
    })
    .catch((error) => {
      console.error("Failed to start Next.js server", error);
      process.exit(1);
    });
}
