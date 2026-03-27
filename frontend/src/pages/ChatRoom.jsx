import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ScoreWindow from "../components/ScoreWindow";
import PublicMessage from "../components/PublicMessage";
import LiveWindow from "../components/LiveWindow";

function ChatRoom() {
  const [storeMessages, setStoreMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [scoreData, setScoreData] = useState([]);

  const env = import.meta.env;

  const ws = useRef(null);

  const navigate = useNavigate();

  const { state } = useLocation();
  const { username, room } = state;

  useEffect(() => {
    const localUsername = username || localStorage.getItem("username");
    const localRoom = room || localStorage.getItem("room");

    const socket = new WebSocket(env.VITE_WS_URL);
    ws.current = socket;

    socket.onopen = handleOpen(socket, localUsername, localRoom);
    socket.onmessage = handleMessage(
      socket,
      setStoreMessages,
      setOnlineUsers,
      setScoreData,
    );
    socket.onerror = handleError(socket);
    socket.onclose = handleClose(socket);

    return () => {
      socket.close();
    };
  }, []);

  function handleSendPublicMessage(data) {
    if (data && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "chat",
          token: localStorage.getItem("token"),
          username: username,
          message: data,
          room: room,
        }),
      );
    }
  }

  function logOut() {
    ws.current.close();
    navigate("/");
  }

  return (
    <div className="flex flex-col h-screen">
      <div className=" text-right dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn m-1">
          Menu
        </div>
        <ul
          tabIndex="-1"
          className="dropdown-content menu bg-base-200 rounded-box z-1 p-2 shadow-sm"
        >
          <li>
            <button onClick={logOut}>Log out</button>
          </li>
        </ul>
      </div>
      <div className="grid grid-rows-2 h-screen">
        <ScoreWindow scoreData={scoreData} />
        <div className="flex border justify-between">
          <PublicMessage
            sendPublicMessage={handleSendPublicMessage}
            storeMessages={storeMessages}
            username={username}
          />
          <LiveWindow onlineUsers={onlineUsers} />
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;

function handleOpen(socket, username, room) {
  socket.addEventListener("open", function starter() {
    console.log("Connected!!");
    socket.send(
      JSON.stringify({
        type: "join",
        username: username,
        token: localStorage.getItem("token"),
        room: room,
      }),
    );
  });
}

function handleMessage(socket, setStoreMessages, setOnlineUsers, setScoreData) {
  socket.addEventListener("message", (ev) => {
    const data = JSON.parse(ev.data);
    console.log(data);

    if (data.type && data.username) {
      const message = {
        username: data.username,
        message: data.message,
        time: data.time,
        type: data.type,
      };

      setStoreMessages((prev) => [...prev, message]);
    }
    // render history messages
    if (data.history) {
      const historyMessages = data.history.map((e) => ({
        username: e.username,
        message: e.message,
        time: e.time,
        type: data.type,
      }));
      setStoreMessages(historyMessages);
    }

    if (data.type == "join" || data.type == "leave") {
      setOnlineUsers(data.onlineUsers);
    }

    if (data.type == "score") {
      setScoreData(data.scoreData);
    }
  });
}

function handleError(socket) {
  socket.addEventListener("error", (error) => {
    console.warn("got Ws error:", error.eventPhase);
  });
}

function handleClose(socket) {
  socket.addEventListener("close", function clear() {
    console.log("Disconnected from the server");
    localStorage.removeItem("token");
  });
}
