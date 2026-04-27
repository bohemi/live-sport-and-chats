function LiveWindow({ onlineUsers }) {
  return (
    <div className="p-2 flex-1">
      <h1 className="border-b text-center">Live Users-{onlineUsers.length}</h1>
      <ul>
        {onlineUsers.map((user, index) => (
          <li className="pt-1 text-center font-bold" key={index}>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default LiveWindow;
