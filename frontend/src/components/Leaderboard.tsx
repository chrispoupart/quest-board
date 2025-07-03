import { useEffect, useState } from 'react';
import { leaderboardService } from '../services/leaderboardService';

function getCurrentMonth() {
  const now = new Date();
  return now.toISOString().slice(0, 7); // YYYY-MM
}

export default function Leaderboard() {
  const [bounty, setBounty] = useState<any[] | null>(null);
  const [quests, setQuests] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const month = getCurrentMonth();
    Promise.all([
      leaderboardService.getBountyLeaderboard(month),
      leaderboardService.getQuestsLeaderboard(month),
    ])
      .then(([bountyData, questsData]) => {
        setBounty(bountyData);
        setQuests(questsData);
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading leaderboard data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading leaderboard data</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full">
      <div
        className="flex-1 bg-white rounded-lg shadow p-6"
        role="region"
        aria-label="Top 5 by Bounty"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Top 5 by Bounty</h2>
        {Array.isArray(bounty) && bounty.length > 0 ? (
          <ol className="space-y-2">
            {bounty.map((user, idx) => (
              <li key={user.name} className="flex justify-between items-center border-b last:border-b-0 py-2">
                <span className="font-medium">{idx + 1}. {user.name}</span>
                <span className="text-blue-600 font-bold">{user.bounty}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center text-gray-400">No data</div>
        )}
      </div>
      <div
        className="flex-1 bg-white rounded-lg shadow p-6"
        role="region"
        aria-label="Top 5 by Quests Completed"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Top 5 by Quests Completed</h2>
        {Array.isArray(quests) && quests.length > 0 ? (
          <ol className="space-y-2">
            {quests.map((user, idx) => (
              <li key={user.name} className="flex justify-between items-center border-b last:border-b-0 py-2">
                <span className="font-medium">{idx + 1}. {user.name}</span>
                <span className="text-green-600 font-bold">{user.questsCompleted}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center text-gray-400">No data</div>
        )}
      </div>
    </div>
  );
}
