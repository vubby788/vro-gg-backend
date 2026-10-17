
const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    project: "vro.gg"
  });
});

// Test endpoint: fetch one approved website.
app.get("/api/page", async (req, res) => {
  try {
    const url = new URL(req.query.url || "");

    if (
      url.protocol !== "https:" ||
      url.hostname !== "example.com" ||
      url.port
    ) {
      return res.status(403).json({
        error: "Only https://httpbin.org is allowed."
      });
    }

    const response = await fetch("https://example.com/", {
      signal: AbortSignal.timeout(10000),
      redirect: "error"
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "The test website could not be fetched."
      });
    }

    const type = response.headers.get("content-type") || "";

    if (!type.includes("text/html")) {
      return res.status(415).json({
        error: "The response was not HTML."
      });
    }

    const html = await response.text();

    if (html.length > 500000) {
      return res.status(413).json({
        error: "The page is too large."
      });
    }

    res.type("html").send(html);
  } catch {
    res.status(400).json({
      error: "Invalid URL or request failed."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("vro.gg backend is running");
});
