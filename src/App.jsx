import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Button } from "@material-ui/core";
import Images from "./yukari/yukariImages";
import yukariTheme from "./yukari/aitheme.jpeg";

/*********************************************
 * スタイルの設定 */
const useStyles = makeStyles((theme) => ({
  container: {
    position: "relative",
    height: "100vh",
    backgroundImage: `url(${yukariTheme})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflow: "hidden",
  },
  chatLogContainer: {
    position: "absolute",
    bottom: 8,
    border: "1px solid rgba(255,255,255,.5)",
    backgroundColor: "rgba(0,0,0, 0.1)",
    borderRadius: 5,
    height: "calc(100% - 50px)",
    width: "20%",
    color: "white",
    fontSize: 14,
    padding: 16,
    marginLeft: 8,
  },
  chatLogTitle: {
    letterSpacing: 3,
    margin: "0 0 16px 0",
    textAlign: "center",
    fontSize: 20,
  },
  scrollArea: {
    overflow: "scroll",
    height: "calc(100% - 100px)",
    marginBottom: 18,
  },
  chatlog: {
    margin: "0 0 4px 0",
  },
  saveBtnContainer: {
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: "#ed4b82",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#e91e63",
    },
  },
  yukari: {
    position: "absolute",
    top: "10%",
    left: "50%",
    transform: "translateX(-51%) rotateZ(-2deg)",
    width: "50%",
    objectFit: "contain",
    animation: "$yukari_move 10s ease infinite",
  },
  "@keyframes yukari_move": {
    "50%": {
      transform: "rotateZ(2deg) translate(-50%, 1%)",
    },
  },
  yukariRes: {
    position: "absolute",
    top: "5%",
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "Kosugi Maru",
    fontSize: 32,
    fontWeight: 600,
    color: "#e190d5",
    letterSpacing: 1.5,
  },
  chatBox: {
    width: "40%",
    position: "absolute",
    bottom: "calc(0% - 16px)",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
  },
  textField: {
    marginRight: 8,
    backgroundColor: "rgba(0,0,0, 0.1)",
    border: "1px solid rgba(255,255,255,.5)",
    borderRadius: 5,
    color: "white",
  },
  textFieldLabel: {
    color: "white",
  },
  talkBtn: {
    backgroundColor: "#ed4b82",
    color: "#fff",
    borderRadius: "100%",
    height: 60,
    width: 60,
    "&:hover": {
      backgroundColor: "#e91e63",
    },
  },
}));
/*********************************************/

let currentId = 0; // チャットログのid

const App = () => {
  const classes = useStyles();

  /*********************************************
   * stateの管理
   */
  const [chat, setChat] = useState("");
  const [chats, setChats] = useState([]);
  const [response, setResponse] = useState("");
  const [responses, setResponses] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [yukariImage, setYukariImage] = useState(Images.normal);

  /*********************************************
   * サーバーとの連携
   */

  const url = "http://localhost:5000";

  const callYukari = async () => {
    const param = {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(chat), // ユーザーが入力したチャットをセット
    };
    try {
      const res = await fetch(url, param);
      const yukariRes = await res.json();

      const newResponse = {
        id: currentId,
        chat: [yukariRes[0] + yukariRes[1]],
        user: false,
        system: false,
      };
      const newResponses = [...responses, newResponse];

      // yukariのセリフをstateに格納
      setResponse("『" + yukariRes[1] + "』");
      // チャットログをstateに格納
      setResponses(newResponses);
      currentId++; // ログのidを更新
      // yukariの表情を更新
      if (yukariRes[2]) {
        setYukariImage(change_looks(yukariRes[2]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 会話内容を記録する
  const save_log = async () => {
    const param = {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify("会話を記録する"),
    };
    try {
      const res = await fetch(url, param);
      const yukariRes = await res.json();
      const newResponse = {
        id: currentId,
        chat: ["===" + yukariRes + "==="],
        user: false,
        system: true,
      };
      const newResponses = [...responses, newResponse];

      // yukariのセリフをstateに格納
      setResponse("『" + yukariRes + "』");
      // チャットログをstateに格納
      setResponses(newResponses);
      currentId++; // ログのidを更新
    } catch (e) {
      console.log(e);
    }
  };

  /*********************************************
   * 関数の定義
   */

  const change_looks = (em) => {
    // 機嫌値によって画像を差し替える
    if (em === 0) {
      return Images.normal;
    } else if (em === 5) {
      return Images.happy;
    } else if (em === 10) {
      return Images.veryhappy;
    } else if (em === -5) {
      return Images.sad;
    } else if (em === -10) {
      return Images.angry;
    }
  };

  const combineChatsWithYukariResponses = (arr1, arr2) => {
    /**
     * ユーザーが入力したチャットログとyukariのレスポンスログを統合し、
     * オブジェクトのキーのidをもとに配列を昇順に並び替える
     *
     * @param arr1  ユーザーが入力したチャットログ
     * @param arr2  yukariのレスポンスログ
     */
    const newChatLog = arr1.concat(arr2);

    // idを昇順に並び替え
    setChatLog(
      newChatLog.sort(function (a, b) {
        if (a.id < b.id) {
          return -1;
        } else {
          return 1;
        }
      })
    );
  };

  const handleChangeChat = (event) => {
    /** ユーザーが入力した文字列をchatに格納
     */
    setChat(event.target.value);
  };

  const handleSubmit = (event) => {
    /**
     * ①chatとidから成るチャットオブジェクトを生成
     * ②チャットオブジェクトをchatsに追加し、新たなチャットリストを生成
     * ③chatを空にし、currentIdを更新
     *
     * @param chat ユーザーが入力した文字列
     */
    event.preventDefault();

    const newChat = {
      id: currentId,
      chat: chat,
      user: true,
      system: false,
    };
    const newChats = [...chats, newChat];
    setChats(newChats);
    setChat("");
    currentId++;

    // yukariからの返信を1秒遅延させる
    setTimeout(callYukari, 1500);
  };

  // yukariのセリフとユーザーの入力を正しい順番に並び替える処理
  useEffect(() => {
    combineChatsWithYukariResponses(chats, responses);
  }, [chats, responses]);

  // 最新のチャットログが見えるように、スクロール位置の頂点をスクロール領域の最下部に設定する
  useEffect(() => {
    const scrollArea = document.getElementById("scroll-area");
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  });

  // 最初に画面を開いた時は通常のyukariの画像を表示する
  useEffect(() => {
    setYukariImage(Images.normal);
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.chatLogContainer}>
        <h3 className={classes.chatLogTitle}>Chatlog</h3>
        <ul id="scroll-area" className={classes.scrollArea}>
          {chatLog.map(({ id, chat, user, system }) => (
            <li key={id}>
              {user ? (
                <p className={classes.chatlog}>あなた > {chat}</p>
              ) : (
                <p className={classes.chatlog}>{chat}</p>
              )}
            </li>
          ))}
        </ul>
        <div className={classes.saveBtnContainer}>
          <Button
            className={classes.saveBtn}
            variant="contained"
            onClick={save_log}
          >
            会話を記録する
          </Button>
        </div>
      </div>
      <img className={classes.yukari} src={yukariImage} alt="yukari" />
      <p className={classes.yukariRes}>{response}</p>
      <form className={classes.chatBox} onSubmit={handleSubmit}>
        <TextField
          label={<span className={classes.textFieldLabel}>ここに入力</span>}
          margin="dense"
          variant="outlined"
          fullWidth
          onChange={handleChangeChat}
          value={chat}
          className={classes.textField}
          InputProps={{ className: classes.textFieldLabel }}
        />
        <Button
          variant="contained"
          className={classes.talkBtn}
          onClick={handleSubmit}
        >
          話す
        </Button>
      </form>
    </div>
  );
};

export default App;
