import { useState, useEffect, useRef } from "react";

function PublicMessage({ sendPublicMessage, storeMessages, username }) {
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [storeMessages]);

  const handleSend = () => {
    if (input.trim()) {
      sendPublicMessage(input);
      setInput("");
    }
  };

  function handleKeyDown(ev) {
    if (ev.key === "Enter") {
      handleSend();
    }
  }

  return (
    <div className="flex flex-col justify-end p-2 gap-2 border-r w-1/3">
      <ul ref={messagesRef} className="flex flex-col gap-1 overflow-y-auto">
        {storeMessages.map((data, index) => (
          <li key={index} className="flex justify-between border-b rounded">
            {data.type == "join" ? (
              <p>{data.message}</p>
            ) : (
              <p>
                {data.username == username ? "You" : data.username}:{" "}
                {data.message}
              </p>
            )}
            <p>[{data.time}]</p>
          </li>
        ))}
      </ul>
      <div className="flex gap-1">
        <input
          className="input w-full"
          placeholder={username + "..."}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn" type="button" onClick={handleSend}>
          {">"}
        </button>
      </div>
    </div>
  );
}

export default PublicMessage;
