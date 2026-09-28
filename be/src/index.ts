import OpenAI from "openai";
import dotenv from "dotenv";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import express from "express";
import { reactBasePrompt } from "./default/react";
import { nodeBasePrompt } from "./default/node";
dotenv.config();

const app = express();
const client = new OpenAI();

app.use(express.json());

app.post('/template', async (req, res) => {
  const prompt = req.body.prompt;

  const response = await client.responses.create({
  model: "gpt-6-luna",
  input: prompt,
  instructions: "Return either node or react based on what do you think this project should be. ONLY RETURN A SINGLE WORD either 'node' or 'react'. Do not return anything extra." 

});
const tech = response.output_text;

if ( tech != "react" && tech != "node") {
  res.status(403).json({
    message: "unable to sleect techstack"
  })
}

if(tech == "react" ) {
  res.json({
    prompts: [, BASE_PROMPT],
    uiPrompts:[reactBasePrompt] 
  })
}

if(tech == "node" ) {
  res.json({
    prompts: [nodeBasePrompt],
    uiPromots: []
  })
}
})

app.listen(3001)

async function main() {
  const stream = await client.responses.create({
    model: "gpt-6-luna",
    input: [
      {
        role: "user",
        content: "",
      },
    ],
    stream: true,
    instructions: String(getSystemPrompt),
  });

  for await (const event of stream) {
    console.log(event);
  }
}

main();