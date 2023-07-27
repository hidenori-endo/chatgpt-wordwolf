import { Configuration, OpenAIApi } from "openai";
import express from "express";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

export const getCompletion = async (jsonData: any, res: express.Response) => {
  // APIキー
  const apiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAIApi(
    new Configuration({
      apiKey: apiKey,
    })
  );

  // ユーザー入力
  const messages = jsonData.messages;

  // function calling
  const functions = [
    {
      name: "set_wordwolf_topic",
      description: "ワードウルフのtopicの作成をする",
      parameters: {
        type: "object",
        properties: {
          topic_majority: {
            type: "string",
            description: "多数派のtopic",
          },
          topic_minority: {
            type: "string",
            description: "少数派のtopic",
          },
        },
        required: ["ワードウルフのtopicを設定してください と書かれていた場合"],
      },
    },
  ];

  try {
    // call api
    console.log(messages);
    const completion = await openai.createChatCompletion(
      {
        model: "gpt-4-0613", //  gpt-3.5-turbo-0613
        messages: messages,
        functions: functions,
        stream: true,
      },
      { responseType: "stream" }
    );

    const stream = completion.data as any as Readable;

    // stream on
    stream.on("data", (chunk) => {
      try {
        let str: string = chunk.toString();

        // [DONE] is the last of steram
        if (str.indexOf("[DONE]") > 0) {
          return;
        }

        // ignore null
        if (str.indexOf('delta":{}') > 0) {
          return;
        }

        console.log(str);

        // Lines to json
        const lines: Array<string> = str.split("\n");
        lines.forEach((line) => {
          // Remove beginning of line
          if (line.startsWith("data: ")) {
            line = line.substring("data: ".length);
          }

          // Ignore Empty
          if (line.trim() == "") {
            return;
          }

          // parse json
          const data = JSON.parse(line);
          let choice = data.choices[0];
          res.write(JSON.stringify(choice));
        });
      } catch (error) {
        console.error(error);
      }
    });

    stream.on("end", () => {
      res.write(JSON.stringify({ finished: true }));
      res.end();
    });
    stream.on("error", (error) => {
      console.error(error);
      res.end(
        JSON.stringify({ error: true, message: "Error generating response." })
      );
    });
  } catch (error) {
    console.error(error);
    res.end();
  }
};
