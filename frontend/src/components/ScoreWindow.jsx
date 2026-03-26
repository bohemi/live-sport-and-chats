function ScoreWindow({ scoreData }) {
  if (!scoreData || scoreData.length < 1) {
    return (
      <div className="border-t p-4 w-full text-center">
        <h2 className="text-xl font-bold mb-2">Live Cricket</h2>
        <p>No live match right now</p>
      </div>
    );
  }

  let leftTeam = {
    inning: scoreData.score[0].inning,
    run: scoreData.score[0].r,
    wicket: scoreData.score[0].w,
    over: scoreData.score[0].o,
  };
  let rightTeam = {
    inning: scoreData.score[1].inning,
    run: scoreData.score[1].r,
    wicket: scoreData.score[1].w,
    over: scoreData.score[1].o,
  };

  return (
    <div className="flex flex-col justify-between border-t p-4 w-full">
      <p className="text-xl font-bold mb-4 text-center">Live Cricket</p>

        <p className="text-lg font-semibold">{scoreData.match}</p>
      <div className="grid grid-cols-2 flex flex-col gap-2 pt-2">

        {/* team left */}
        <div className="border p-2">
        <p><strong>Ining:</strong> {leftTeam.inning}</p>
        <p><strong>Run:</strong> {leftTeam.run}</p>
        <p><strong>Wicket:</strong> {leftTeam.wicket}</p>
        <p><strong>Over:</strong> {leftTeam.over}</p>
        </div>
        {/* team right */}
        <div className="border p-2">
        <p><strong>Ining:</strong> {rightTeam.inning}</p>
        <p><strong>Run:</strong> {rightTeam.run}</p>
        <p><strong>Wicket:</strong> {rightTeam.wicket}</p>
        <p><strong>Over:</strong> {rightTeam.over}</p>
        </div>
      </div>
      <p className="text-center border">Status: {scoreData.status || "Live"}</p>
    </div>
  );
}

export default ScoreWindow;
