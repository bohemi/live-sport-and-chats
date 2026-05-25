import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const [username, setuserName] = useState("");
  const [password, setpassword] = useState("");
  const [room, setRoom] = useState("");
  const [disableLogInAndSignup, setDisableLogInAndSignup] = useState(false);
  const [isServerWarmingUp, setIsServerWarmingUp] = useState(false);

  const navigate = useNavigate();

  const env = import.meta.env;

  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        // give a 1.5 seconds of window to check if server is already
        // awake by fetching
        const timeoutId = setTimeout(() => setIsServerWarmingUp(true), 1500);
        // if fetch return before 1.5 seconds then the server was awake
        await fetch(env.VITE_WAKEUP_BACKEND);

        clearTimeout(timeoutId);
        // server has been awake
        setIsServerWarmingUp(false);
      } catch (err) {
        console.error("Failed to wakeup server", err);
      }
    };

    wakeUpServer();
  }, []);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!username || !password || !room) {
      alert("Please fill all the details");
      return;
    }

    setDisableLogInAndSignup(true);

    try {
      const res = await fetch(env.VITE_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error(
          `The server is waking up or busy (Status:${res.status}).`,
        );
      }
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("username", username);
        localStorage.setItem("room", room);
        localStorage.setItem("token", data.token);

        navigate("/chatroom", { state: { username, room } });
      } else {
        alert(data.message);
        setDisableLogInAndSignup(false);
      }
    } catch (error) {
      alert(`connection failed: ${error.message}`);
      setDisableLogInAndSignup(false);
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

          {/* choose room selection buttons */}
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
          </div>

          <button
            type="submit"
            className="btn btn-neutral mt-4"
            disabled={disableLogInAndSignup}
          >
            Login
          </button>

          <p className="m-auto">or</p>
          <button
            onClick={() => navigate("/signup")}
            type="button"
            className="btn underline"
            disabled={disableLogInAndSignup}
          >
            Sign Up
          </button>
        </fieldset>
      </form>

      {isServerWarmingUp && (
        <p className="text-center text-amber-500 text-sm animate-pulse mt-2">
          server is waking up. it may take a liitle longer...
        </p>
      )}
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
