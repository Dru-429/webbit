import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI();

async function main() {
  const stream = await client.responses.create({
    model: "gpt-6-luna",
    input: [
      {
        role: "user",
        content: "Create a simple todo web app",
      },
    ],
    stream: true,
  });

  for await (const event of stream) {
    console.log(event);
  }
}

main();
