import React, { useState, createContext, useRef, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { useApi } from "./hooks/useApi";
import { useMessageHistory } from "./hooks/useMessageHistory";
import Modal from "./components/modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

export const DataContext = createContext({
  modalVisible: true,
  setModalVisible: (progress: boolean) => {},
  buttonVisible: true,
  setButtonVisible: (progress: boolean) => {},
});

const App = () => {
  // 定数
  const names = ["Me", "Taro", "Hanako", "Tsuyoshi"];
  // ステート
  const [cnt, setCnt] = useState(0);
  const [dataset, setDataset] = useState(
    {} as { [key: string]: { topic: string } }
  );
  const [modalVisible, setModalVisible] = useState(true);
  const [buttonVisible, setButtonVisible] = useState(true);

  const [ApiProgress, setApiProgress] = useState(false); // API送信
  const [messageValue, setMessage] = useState<string>("こんにちは"); // input
  const [answerValue, setAnswer] = useState<string>(""); // 結果

  // Ref
  const formRef = useRef<HTMLFormElement>(null)!;
  const messageAreaRef = useRef<HTMLTextAreaElement>(null)!;
  const pastAreaRef = useRef<HTMLTextAreaElement>(null)!;

  // カスタムフック
  const { fetchApiData } = useApi();
  const { messageHistory: firstMessage } = useMessageHistory(
    "ワードウルフtopicを設定してください。\n多数派のtopicには適当な単語をランダムに入れて、少数派のtopicには多数派のトピックと紛らわしいが異なる単語を設定してください（例：海に対してプール、スイカに対してメロン、セロテープに対してガムテープ など 犬に対して猫 などあからさまに推測できるものは避ける）"
  );
  const { messageHistory, appendHistory } = useMessageHistory(
    "You are a useful assistant"
  );

  useEffect(() => {
    console.log(cnt); // これは新しい値を表示します。
  }, [cnt]);

  useEffect(() => {
    console.log(messageHistory); // これは新しい値を表示します。
  }, [messageHistory]);

  // useEffect
  useEffect(() => {
    if (!buttonVisible) {
      const fetchData = async () => {
        const reader = await fetchApiData("", firstMessage);
        await readChunk(reader, "function");
      };
      fetchData(); // 実行
      setCnt(cnt + 1);
    }
  }, [buttonVisible]);

  // 送信
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    afterClickedButton(e.target as HTMLFormElement);
  };

  const sendMessage = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.shiftKey && e.key === "Enter") {
      if (formRef.current) {
        afterClickedButton(formRef.current);
      }
    }
  };

  // クリックの処理後、ApiProgressをtrueにする
  const afterClickedButton = (e: HTMLFormElement) => {
    if (messageAreaRef.current) {
      if (messageAreaRef.current.value.trim() === "") {
        return;
      }

      let beforeUserData = "";

      // if (cnt % 3 === 1) {
      //   beforeUserData = "太郎として会話に応じてください\n\n";
      // } else if (cnt % 3 === 2) {
      //   beforeUserData = "花子として会話に応じてください\n\n";
      // } else if (cnt % 3 === 0) {
      //   beforeUserData = "つよしとして会話に応じてください\n\n";
      // }

      // 履歴に追加
      appendHistory(
        "user",
        beforeUserData + "私「" + messageAreaRef.current.value + "」"
      );

      setMessage("");
      messageAreaRef.current?.focus();

      // console.log(data);

      // チャット画面に表示
      if (!answerValue) {
        setAnswer("[あなた]\n" + messageAreaRef.current.value.trim());
      } else {
        setAnswer(
          answerValue + "\n\n[あなた]\n" + messageAreaRef.current.value.trim()
        );
      }
    }

    setApiProgress(true);
  };

  useEffect(() => {
    if (ApiProgress) {
      // 非同期通信
      const fetchData = async () => {
        // [assistant]
        setAnswer((currentanswer) => {
          return currentanswer + "\n\n[assistant]\n";
        });

        // 送信
        const reader = await fetchApiData("", messageHistory);

        await readChunk(reader);
      };
      fetchData(); // 実行
      setCnt(cnt + 1);

      // API呼び出しが終わったら ApiProgressをfalseに
      setApiProgress(false);
    }
  }, [ApiProgress]);

  // 取得したデータの処理（通常）
  let allMessage = "";
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
                  // console.log(data.delta);
                  if (mode === "function") {
                    try {
                      content = data.delta.function_call.arguments;
                    } catch (error) {
                      content = data.delta.content;
                    }
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

                    appendHistory(
                      "user",
                      "ワードウルフのゲームをします。\n太郎、花子、つよし3名の雑談を1回ずつ生成してください。\n\n私のお題は「" +
                        newDataset.Me.topic +
                        "」、太郎のお題は「" +
                        newDataset.Taro.topic +
                        "」、花子のお題は「" +
                        newDataset.Hanako.topic +
                        "」、つよしのお題は「" +
                        newDataset.Tsuyoshi.topic +
                        "」です。\n\n・お題はお互いに知らないものとします。\n・自分のお題について、なるべく遠回りな表現をして推測されづらいようにしてください。名称にも直接触れず「ここ」「これ」などと表現してください\n\nフォーマットは以下に従ってください\n太郎「(ここに太郎のセリフを入力)」\n花子「(ここに花子のセリフを入力)」\nつよし「(ここにつよしのセリフを入力)」"
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
                    appendHistory("assistant", allMessage);
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

  return (
    <div className="container-fluid">
      <DataContext.Provider
        value={{
          modalVisible,
          setModalVisible,
          buttonVisible,
          setButtonVisible,
        }}
      >
        <Modal />
      </DataContext.Provider>
      <Form ref={formRef} onSubmit={submit}>
        <Row>
          <Col xs={12} md={6} className="mx-auto">
            <Form.Group className="mt-4" controlId="input">
              <Form.Label>request</Form.Label>
              <Form.Control
                as="textarea"
                className="question"
                ref={messageAreaRef}
                name="message"
                defaultValue={messageValue}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={sendMessage}
              />
              <Form.Control as="button" type="submit" className="mt-3">
                send
              </Form.Control>
            </Form.Group>

            <Form.Group className="mt-4" controlId="input">
              <Form.Label>response</Form.Label>
              <Form.Control
                disabled
                as="textarea"
                className="answer"
                ref={pastAreaRef}
                name="pastMessage"
                value={answerValue}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default App;
