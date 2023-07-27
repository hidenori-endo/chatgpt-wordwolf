import { useState } from "react";

export const useReadChunk = () => {
  const [allMessage, setAllMessage] = useState("");

  const readChunk = async (
    reader: ReadableStreamDefaultReader,
    mode: string = "assistant"
  ) => {
    const decoder = new TextDecoder("utf-8");

    return reader.read().then(({ value, done }): any => {
      try {
        if (!done) {
          // }{ で分割、
          let dataString =
            "[" + decoder.decode(value).replaceAll("}{", "},{") + "]";
          // console.log(dataString);

          try {
            let dataArray = JSON.parse(dataString);

            for (let data of dataArray) {
              // エラー時
              if (data.error) {
                console.error(
                  "Error while generating content: " + data.message
                );
              } else {
                let content: string = "";

                if (!data.finished) {
                  // function_call
                  if (mode === "function") {
                    content = data.delta.function_call.arguments;
                    // 通常メッセージ
                  } else {
                    content = data.delta.content;

                    // 文字出力
                    setAnswer((currentanswer) => {
                      return currentanswer + content;
                    });
                  }

                  allMessage += content;
                  // console.log(allMessage);
                } else {
                  // 終了時
                  if (mode === "function") {
                    const topics = JSON.parse(allMessage);

                    let randomName =
                      names[Math.floor(Math.random() * names.length)];

                    console.log(topics);
                    let newDataset = { ...dataset };
                    for (let name of names) {
                      newDataset[name] =
                        name === randomName
                          ? { topic: topics.topic_minority }
                          : { topic: topics.topic_majority };
                    }
                    setDataset(newDataset);

                    appendResponse(
                      "user",
                      "ワードウルフのゲームをします。私のお題は「" +
                        newDataset.Me.topic +
                        "」、太郎のお題は「" +
                        newDataset.Taro.topic +
                        "」、花子のお題は「" +
                        newDataset.Hanako.topic +
                        "」、つよしのお題は「" +
                        newDataset.Tsuyoshi.topic +
                        "」です。"
                    );

                    // モーダル非表示
                    setModalVisible(!modalVisible);

                    setAnswer((currentanswer) => {
                      return (
                        currentanswer +
                        "[assistant]\nあなたのお題は「" +
                        newDataset.Me.topic +
                        "」です。ゲームをはじめましょう"
                      );
                    });
                  } else {
                    appendResponse("assistant", allMessage);
                  }
                }
              }
            }
          } catch (error) {
            // JSONパースエラー
            console.log(error);
          }
        } else {
          console.log("done");
        }
      } catch (error) {
        console.log(error);
      }
      if (!done) {
        return readChunk(reader, mode);
      }
    });
  };

  return { readChunk, allMessage };
};
