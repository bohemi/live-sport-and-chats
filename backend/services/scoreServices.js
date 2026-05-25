import { getLiveCricketScore } from "../api/fetchScore.js";
import logger from "../utils/logger.js";

export default function startScoreUpdates(rooms) {
  logger.info(`activating live score interval fetch!`);
  setInterval(async () => {
    // cricket
    if (rooms.cricket.length > 0) {
      try {
        const cricketScore = await getLiveCricketScore(process.env.CRICKET_URL);

        if (cricketScore) {
          const payLoad = JSON.stringify({
            type: "score",
            room: "cricket",
            scoreData: cricketScore,
          });
          // send the scores
          rooms.cricket.forEach((user) => {
            if (user.socket.readyState === 1) {
              user.socket.send(payLoad);
            }
          });
        }
      } catch (err) {
        logger.error(`score update failed: ${err.message}`);
      }
    }
  }, 3000);
}
