import { useState, useEffect } from 'react';

// A slide-in panel from the right, used to create or edit a task.
export default function TaskModal({ isOpen, onClose, onSave, teams, members, task }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('todo');

  // When the panel opens, fill the form (with task data if we are editing)
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setTeamId(String(task.team_id || ''));
      // Convert assigned_to to string for consistent select handling
      setAssignedTo(task.assigned_to ? String(task.assigned_to) : '');
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '');
      setStatus(task.status || 'todo');
    } else {
      setTitle('');
      setDescription('');
      setTeamId(teams[0] ? String(teams[0].id) : '');
      setAssignedTo('');
      setDueDate('');
      setStatus('todo');
    }
  }, [task, isOpen, teams]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();

    // Joi expects assigned_to to be either a number or null (undefined is risky with
    // backend logic that checks `'assigned_to' in value`).
    const nextAssignedTo = (() => {
      if (assignedTo === '' || assignedTo === null || typeof assignedTo === 'undefined') return null;
      const n = Number(assignedTo);
      return Number.isFinite(n) ? n : null;
    })();

    onSave({
      title,
      description,
      team_id: Number(teamId),
      assigned_to: nextAssignedTo,
      due_date: dueDate || undefined,
      status,
    });
  }

  return (
    // Dark overlay + panel sliding in from the right edge
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{task ? 'Edit task' : 'New task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              {teams.map((team) => (
                <option key={team.id} value={String(team.id)}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Assignee</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={String(member.id)}>
                  {member.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            >
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            {task ? 'Save changes' : 'Create task'}
          </button>
        </form>
      </div>
    </div>
  );
}