🏟️ LiveSport Sync: Real-Time Fan Engagement Hub
A full-stack, real-time communication platform where sports fans can join dedicated room, view live score feeds, and engage in public discourse via WebSockets.

🚀 Key Features
Real-Time Bi-directional Communication: Built with WebSocket.

Dynamic Rooms: Users can join specific sports channels(more coming soon); messages are isolated to the relevant "Room".

Live Score Integration: Backend-driven score updates pushed to all connected clients in a room via the server.

Session Management: Persistent user identification (implemented via JWT) to track active participants in the chat.

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, WebSocket.

Backend: Node.js, Express.js.

Real-time Engine: Socket.io (WebSockets).

Database: MongoDB (for chat history and user profiles).

Security: JWT Authentication & bcrypt.

🏗️ System Architecture
The application uses a "Full-Duplex" architecture. Unlike standard REST APIs, once a user "Handshakes" with the server, a persistent tunnel is kept open.