function ScoreWindow({ matchData }) {
  if (!matchData || matchData.length < 1) {
    return (
      <div className="border-t p-4 w-full text-center">
        <h2 className="text-xl font-bold mb-2">Match</h2>
        <p>Please wait...</p>
      </div>
    );
  }
  // to do----------change to states------------
  
  let firstTeam = {
    inning: matchData.teamOne?.inning || "no updates",
    run: matchData.teamOne?.r || "no updates",
    wicket: matchData.teamOne?.w || "no updates",
    over: matchData.teamOne?.o || "no updates",
  };
  let secondTeam = {
    inning: matchData.teamTwo?.inning || "no updates",
    run: matchData.teamTwo?.r || "no updates",
    wicket: matchData.teamTwo?.w || "no updates",
    over: matchData.teamTwo?.o || "no updates",
  };

  return (
    <div className="flex flex-col sm:justify-between border-t p-2">
      <p className="text-xl font-bold mb-4 text-center">Match</p>

      <p className="text-lg text-center font-semibold">{matchData.matchName || "Match"}</p>
      <div className="grid grid-cols-2 flex flex-col gap-2 pt-2 pb-2">
        {/* team left */}
        <div className="border p-2">
          <p>
            <strong>Ining:</strong> {firstTeam.inning || ""}
          </p>
          <p>
            <strong>Run:</strong> {firstTeam.run || ""}
          </p>
          <p>
            <strong>Wicket:</strong> {firstTeam.wicket || ""}
          </p>
          <p>
            <strong>Over:</strong> {firstTeam.over || ""}
          </p>
        </div>
        {/* team right */}
        <div className="border p-2">
          <p>
            <strong>Ining:</strong> {secondTeam.inning || ""}
          </p>
          <p>
            <strong>Run:</strong> {secondTeam.run || ""}
          </p>
          <p>
            <strong>Wicket:</strong> {secondTeam.wicket || ""}
          </p>
          <p>
            <strong>Over:</strong> {secondTeam.over || ""}
          </p>
        </div>
      </div>
      <p className="text-center border">Status: {matchData.status || "Live"}</p>
    </div>
  );
}

export default ScoreWindow;
