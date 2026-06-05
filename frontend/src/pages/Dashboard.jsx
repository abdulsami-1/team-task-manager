import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TeamList from '../components/TeamList';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { getTeams, getTasks, getTeamMembers, createTask, updateTask, deleteTask } from '../api';

export default function Dashboard({ user, onLogout }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [taskList, setTaskList] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState(''); // NEW: filter by assignee
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Load teams once when the dashboard mounts
  useEffect(() => {
    getTeams().then(setTeams).catch(console.error);
  }, []);

  // Reload tasks (and members) whenever the selected team changes
  useEffect(() => {
    loadTasks(selectedTeam);
    if (selectedTeam) {
      getTeamMembers(selectedTeam.id).then(setMembers).catch(console.error);
    } else {
      setMembers([]);
      setAssigneeFilter(''); // reset assignee filter when switching teams
    }
  }, [selectedTeam]);

  async function loadTasks(team = selectedTeam) {
    const filters = team ? { team_id: team.id } : {};
    const tasks = await getTasks(filters);
    setTaskList(tasks);
  }

  async function handleSaveTask(taskData) {
    if (editingTask) {
      // Strip team_id — updateTaskSchema does not accept it, and it should not change on edit
      const { team_id, ...updates } = taskData;
      await updateTask(editingTask.id, updates);
    } else {
      await createTask(taskData);
    }
    setIsPanelOpen(false);
    setEditingTask(null);
    await loadTasks(); // await so the list is fresh before the panel closes visually
  }

  async function handleDeleteTask(id) {
    await deleteTask(id);
    await loadTasks();
  }

  function openNewTask() {
    setEditingTask(null);
    setIsPanelOpen(true);
  }

  function openEditTask(task) {
    setEditingTask(task);
    setIsPanelOpen(true);
  }

  // Filter tasks by search text AND assignee
  const visibleTasks = taskList.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesAssignee = assigneeFilter
      ? String(task.assigned_to) === assigneeFilter
      : true;
    return matchesSearch && matchesAssignee;
  });

  // Bonus feature: tasks due today or tomorrow
  const dueSoonTasks = taskList.filter((task) => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    return sameDay(due, today) || sameDay(due, tomorrow);
  });

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="flex flex-1 flex-col md:flex-row">
        <TeamList
          teams={teams}
          selectedTeam={selectedTeam}
          onSelectTeam={setSelectedTeam}
          onTeamCreated={(team) => {
            setTeams([team, ...teams]);
            setSelectedTeam(team);
          }}
        />

        <main className="flex-1 p-6">
          {/* Due-soon banner (bonus feature) */}
          {dueSoonTasks.length > 0 && (
            <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
              You have {dueSoonTasks.length} task(s) due today or tomorrow.
            </div>
          )}

          {/* Search + assignee filter + new task bar */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search tasks..."
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />

            {/* Assignee filter — only shown when a team is selected (so members are available) */}
            {selectedTeam && members.length > 0 && (
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none"
              >
                <option value="">All assignees</option>
                {members.map((member) => (
                  <option key={member.id} value={String(member.id)}>
                    {member.username}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={openNewTask}
              disabled={teams.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-40"
            >
              + New task
            </button>
          </div>

          {/* Task list */}
          {teams.length === 0 ? (
            <p className="text-sm text-slate-500">Create a team first to start adding tasks.</p>
          ) : visibleTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks found.</p>
          ) : (
            <div className="space-y-2">
              {visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={handleDeleteTask} />
              ))}
            </div>
          )}
        </main>
      </div>

      <TaskModal
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        teams={teams}
        members={members}
        task={editingTask}
      />
    </div>
  );
}
