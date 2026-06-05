import { useState } from 'react';
import { createTeam } from '../api';

export default function TeamList({ teams, selectedTeam, onSelectTeam, onTeamCreated }) {
  const [newTeamName, setNewTeamName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const team = await createTeam(newTeamName.trim());
    onTeamCreated(team);
    setNewTeamName('');
    setIsAdding(false);
  }

  return (
    <aside className="w-full border-b border-slate-100 bg-white p-4 md:w-60 md:border-b-0 md:border-r">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Teams</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="text-lg font-bold text-accent">
          +
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="mb-3">
          <input
            autoFocus
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Team name"
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
          />
        </form>
      )}

      <ul className="space-y-1">
        {/* "All tasks" clears the team filter */}
        <li>
          <button
            onClick={() => onSelectTeam(null)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              !selectedTeam
                ? 'bg-accent/10 font-semibold text-accent'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All tasks
          </button>
        </li>
        {teams.map((team) => (
          <li key={team.id}>
            <button
              onClick={() => onSelectTeam(team)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                selectedTeam && selectedTeam.id === team.id
                  ? 'bg-accent/10 font-semibold text-accent'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {team.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}