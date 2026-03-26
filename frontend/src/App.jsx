import { Route, Routes } from "react-router";
import ChatRoom from "./pages/ChatRoom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/chatroom" element={<ChatRoom />} />
      </Routes>
    </>
  );
}

export default App;
