import { useState } from "react";
import { useNavigate } from "react-router";


export default function SignUpPage() {
  const [username, setuserName] = useState("");
  const [password, setpassword] = useState("");
  const [room, setRoom] = useState("");
  
  const navigate = useNavigate();
  const env = import.meta.env;

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!username || !password || !room) {
      alert("Please fill/select all the details");
      return;
    }
    const res = await fetch(env.VITE_SIGNUP_URL, {
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
    <div className="">
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
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
            Create
          </button>

          <p className="m-auto">or</p>
          <button
            onClick={() => navigate("/")}
            type="button"
            className="btn underline"
          >
            Log-In
          </button>
        </fieldset>
      </form>
    </div>
  );
}
