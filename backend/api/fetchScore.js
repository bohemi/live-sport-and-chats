import redisClient from "../services/redisService.js";
import logger from "../utils/logger.js";

export async function getLiveCricketScore(url) {
  const cacheKey = process.env.REDIS_KEY;
  try {
    const cachedScore = await redisClient.get(cacheKey);

    if (cachedScore) {
      logger.info("API data found in redis cache");
      return JSON.parse(cachedScore);
    }

    logger.info("API data expired in redis. fetching from api url");

    const res = await fetch(url);
    const data = (await res.json()).data;

    if (!data || data.length === 0) {
      logger.error("no data from the API!");
      return null;
    }

    const matchData = getMatchData(data);
    // set redis cache for 7 seconds
    await redisClient.setEx(cacheKey, 7, JSON.stringify(matchData));

    return matchData;
  } catch (err) {
    logger.error(`Error fetching score: ${err.message}`);
    return null;
  }
}
// for now only return the data which contains the match score
// which will have overs,wicket,runs. the match which has not
// started will break the frontend page
function getMatchData(data) {
  for (const match of data) {
    if (match.score) {
      return {
        matchName: match.name,
        status: match.status,
        teamOne: match.score[0],
        teamTwo: match.score[1],
        teamOneImg: match.teamInfo[0].img,
        teamTwoImg: match.teamInfo[1].img,
      };
    }
  }
  // if no match has started which is unlikely but its a safety
  return data[0];
}
