Visit here - https://live-sport-room.netlify.app/

🏟️ LiveSport Sync: Real-Time Fan Engagement Hub
A full-stack, real-time communication platform where sports fans can join dedicated room, view live score feeds, and engage in public discourse via WebSockets.

🚀 Key Features
Real-Time Bi-directional Communication: Built with WebSocket.

Dynamic Rooms: Users can join specific sports channels(more coming soon); messages are isolated to the relevant "Room".

Live Score Integration: Backend-driven score updates pushed to all connected clients in a room via the server.

Session Management: Persistent user identification (implemented via JWT) to track active participants in the chat.

Tech Stack
Frontend: **React.js**, **daisyUi**, **Tailwind CSS**.

Backend: **Node.js**, **Express.js**.

Real-time Engine: **ws** (WebSocket library).

Database: **MongoDB** (for chat history and user profiles).

Security: **JWT** Authentication & bcrypt, **Zod**.

Performance Optimization: low latency on live cricket scores with caching in **Redis** with a 5-second automatic expiration.

System Architecture
The application uses a "Full-Duplex" architecture. Unlike standard REST APIs, once a user "Handshakes" with the server, a persistent tunnel is kept open.

## 🛠️ How to Run Locally

You do **not** need to install Node, Nginx, or Redis on your host machine. The entire system is fully orchestrated via Docker.

### Prerequisites
Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose V2](https://docs.docker.com/compose/install/) installed.

### 1. Clone the Repository
```bash
git clone [https://github.com/bohemi/live-sport-and-chats.git](https://github.com/bohemi/live-sport-and-chats.git)
cd live-sport-and-chats