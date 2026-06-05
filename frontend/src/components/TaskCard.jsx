// Maps each status to a colored pill style
const statusStyles = {
  todo: 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
};

const statusLabels = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-slate-200 hover:shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          <h3 className="truncate font-medium text-slate-800">{task.title}</h3>
        </div>
        <div className="mt-1 flex gap-3 text-xs text-slate-400">
          {task.assigned_username && <span>Assignee: {task.assigned_username}</span>}
          {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={() => onEdit(task)} className="text-sm text-slate-500 hover:text-accent">
          Edit
        </button>
        <button onClick={() => onDelete(task.id)} className="text-sm text-slate-500 hover:text-red-500">
          Delete
        </button>
      </div>
    </div>
  );
}