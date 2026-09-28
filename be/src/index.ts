import OpenAI from "openai";
import dotenv from "dotenv";
import { getSystemPrompt } from "./prompts";
dotenv.config();

const client = new OpenAI();

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