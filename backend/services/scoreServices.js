import { getLiveCricketScore } from "../api/fetchScore.js";
import logger from "../utils/logger.js";

export default function startScoreUpdates(rooms) {
  setInterval(async () => {
    // cricket
    if (rooms.cricket.length > 0) {
      logger.info(`getting live score every 10 seconds`);
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
      } catch (error) {
        logger.error(`score update failed: ${error}`);
      }
    }
  }, 10000);
}
