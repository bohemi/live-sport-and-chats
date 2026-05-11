import logger from "../utils/logger.js";

export async function getLiveCricketScore(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const match = data.data[0];

    return {
      match: match.name,
      score: match.score,
      over: match.over,
      status: match.status,
    };
  } catch (err) {
    logger.error(`Error fetching score: ${error}`);
    return null;
  }
}
