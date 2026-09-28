import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import { reactBasePrompt } from "./default/react.ts";
import { nodeBasePrompt } from "./default/node.ts";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.ts";
dotenv.config();

const app = express();
const client = new OpenAI();

app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  const response = await client.responses.create({
    model: "gpt-6-luna",
    input: prompt,
    instructions:
      "Return either node or react based on what do you think this project should be. ONLY RETURN A SINGLE WORD either 'node' or 'react'. Do not return anything extra.",
  });
  const tech = response.output_text;

  if (tech == "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if (tech == "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  res.status(403).json({
    message: "unable to sleect techstack",
  });

  return;
});

app.post("/chat", async( req, res) => {
  const message = req.body.message;

  const response = await client.responses.create({
    model: "gpt-6-luna",
    input: message,
    instructions: String(getSystemPrompt),
  });

  const resp = response.output_text;
  console.log(resp); 

  res.json({
    response: resp,
  })
})

app.listen(3001);

// async function main() {
//   const stream = await client.responses.create({
//     model: "gpt-6-luna",
//     input: [
//       {
//         role: "user",
//         content: "",
//       },
//     ],
//     stream: true,
//     instructions: String(getSystemPrompt),
//   });

//   for await (const event of stream) {
//     console.log(event);
//   }
// }

// main();
