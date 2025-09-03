import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// --- Configurable constants ---
const ERROR_PROBABILITIES = {
  INTERNAL_SERVER_ERROR: 0.1, // 10% chance
  BAD_REQUEST: 0.1, // 10% chance
  UNAUTHORIZED: 0.1, // 10% chance
};
const MAX_REQUESTS = 5; // Maximum requests allowed per second

// Middleware to simulate latency and timeout
app.use((req, res, next) => {
  const latency = Math.random() * 1000; // Random latency up to 1 second
  setTimeout(() => {
    if (latency > 900) {
      // Simulate timeout for high latency
      return res.status(504).json({ error: "Gateway Timeout" });
    }
    next();
  }, latency);
});

// Middleware to simulate different error codes based on probability
app.use((req, res, next) => {
  const errorProbability = Math.random();
  if (errorProbability < ERROR_PROBABILITIES.INTERNAL_SERVER_ERROR) {
    return res.status(500).json({ error: "Internal Server Error" });
  } else if (
    errorProbability <
    ERROR_PROBABILITIES.INTERNAL_SERVER_ERROR + ERROR_PROBABILITIES.BAD_REQUEST
  ) {
    return res.status(400).json({ error: "Bad Request" });
  } else if (
    errorProbability <
    ERROR_PROBABILITIES.INTERNAL_SERVER_ERROR +
      ERROR_PROBABILITIES.BAD_REQUEST +
      ERROR_PROBABILITIES.UNAUTHORIZED
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Middleware to simulate throughput control
let requestCount = 0;
setInterval(() => (requestCount = 0), 1000); // Reset count every second
app.use((req, res, next) => {
  if (requestCount >= MAX_REQUESTS) {
    return res.status(429).json({ error: "Too Many Requests" });
  }
  requestCount++;
  next();
});

// --- Communication API Provider 1 ---
app.post("/communication-1/send", (req, res) => {
  // Parameters: recipient (phone/email), sender (phone/email), content
  const { recipient, sender, content } = req.body;
  // ...dummy logic...
  res.json({
    message: "Dummy communication sent (Provider 1)",
    received: { recipient, sender, content },
  });
});

// --- Communication API Provider 2 ---
app.post("/communication-2/send", (req, res) => {
  // Parameters: to (phone/email), from (phone/email), message
  const { to, from, message } = req.body;
  // ...dummy logic...
  res.json({
    message: "Dummy communication sent (Provider 2)",
    received: { to, from, message },
  });
});

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Dummy Communication API server running on port ${PORT}`);
});
