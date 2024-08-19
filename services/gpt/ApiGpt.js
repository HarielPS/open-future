import OpenAI from "openai";
import axios from "axios";
import { Prompt } from "./promps";
const openai = new OpenAI({
  apiKey: process.env.APY_KEY_OPENAI,
  dangerouslyAllowBrowser: true,
});

const GPT = {};

GPT.pdfToBase64ForLink = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");
  return buffer.toString("base64");
};

GPT.analiceSignupCompany = async (context, financialDoc) => {
  const input = Prompt.PrompAnaliceSignupCompany + context;
  //const Docbase64 = GPT.pdfToBase64ForLink(financialDoc);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `${input}` },
          {
            type: "image_url",
            image_url: {
              //url: `data:image/pdf;base64,{${Docbase64}}`,
              url: `${financialDoc}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  return completion.choices[0].message.content;
};

GPT.analicenewProjectCompany = async (context, financialDoc) => {
  const input = Prompt.PrompNewProjectCompany + context;
  //const base64_image = GPT.pdfToBase64ForLink(context.financialDoc);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `${input}` },
          {
            type: "image_url",
            image_url: {
              //image_url: { url: `data:image/pdf;base64,{${financialDoc}}` },
              url: `${financialDoc}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  return completion.choices[0].message.content;
};

export default GPT;
