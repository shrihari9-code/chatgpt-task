const PORT = 8000;
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = "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";

app.post("/completions", async (req, res) => {
  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // Specify the model name for GPT-3.5 Turbo
      messages: [{ role: "user", content: req.body.message }],
      max_tokens: 100,
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );

    console.log("Response:", response);

    const data = await response.json();
    console.log("Data:", data);

    res.send(data);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log("Running on port " + PORT));
