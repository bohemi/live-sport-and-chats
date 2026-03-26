import { useState } from "react";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const [username, setuserName] = useState("");
  const [password, setpassword] = useState("");
  const [room, setRoom] = useState("");
  
  const navigate = useNavigate();
  
  // getOrRemoveLocalStorage("get")
  const env = import.meta.env;

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!username || !password || !room) {
      alert("Please fill/select all the details");
      return;
    }

    const res = await fetch(env.VITE_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      navigate("/chatroom", { state: { username, room } });

      localStorage.setItem("username", username);
      localStorage.setItem("room", room);
      localStorage.setItem("token", data.token);
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box m-auto w-xs border p-4">
          <legend className="fieldset-legend">User Credentials</legend>

          <label className="label">User Name</label>
          <input
            required
            onChange={(e) => setuserName(e.target.value)}
            type="text"
            className="input"
            placeholder="user name"
          />

          <label className="label">Password</label>
          <input
            required
            onChange={(e) => setpassword(e.target.value)}
            type="password"
            className="input"
            placeholder="Password"
          />

          {/* choose room */}
          <div className="">
            <input
              className="btn"
              type="radio"
              name="rooms"
              aria-label="cricket"
              value={"cricket"}
              required
              onChange={(e) => setRoom(e.target.value)}
            />
            {/* <input
              className="btn"
              type="radio"
              name="rooms"
              aria-label="football"
              value={"football"}
              onChange={(e) => setRoom(e.target.value)}
            />
            <input
              className="btn"
              type="radio"
              name="rooms"
              aria-label="basketball"
              value={"basketball"}
              onChange={(e) => setRoom(e.target.value)}
            /> */}
          </div>

          <button type="submit" className="btn btn-neutral mt-4">
            Login
          </button>

          <p className="m-auto">or</p>
          <button
            onClick={() => navigate("/signup")}
            type="button"
            className="btn underline"
          >
            Sign Up
          </button>
        </fieldset>
      </form>
    </div>
  );
}

function getOrRemoveLocalStorage(type) {
  if (type === "remove") {
    const allItems = Object.keys(localStorage).map((key) => {
      console.log("Removed: ", localStorage.getItem(key));
      localStorage.removeItem(key);
    });
  }
  if (type === "get") {
    const allItems = Object.keys(localStorage).map((key) => {
      const value = localStorage.getItem(key);
      try {
        return { key, value: JSON.parse(value) };
      } catch (e) {
        return { key, value };
      }
    });
    console.log("local values:", allItems);
  }
}
