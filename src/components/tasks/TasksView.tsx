import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, User, Calendar, Trash2 } from 'lucide-react';
import { TaskAssignment } from '../../types/livestock';
import { Badge } from '../common/Badge';

interface TasksViewProps {
  tasks: TaskAssignment[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenNewTask
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter] = useState<string>('all');

  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const urgentCount = useMemo(() => tasks.filter(t => !t.completed && t.priority === 'urgente').length, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesStatus = filter === 'all' || (filter === 'pending' ? !t.completed : t.completed);
      const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesStatus && matchesCat;
    });
  }, [tasks, filter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Tareas Pendientes</span>
          <span className="text-2xl font-black text-slate-900">{pendingTasks.length}</span>
          <span className="text-[10px] text-slate-500 block font-medium">Por ejecutar en campo</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Tareas Urgentes</span>
          <span className={`text-2xl font-black ${urgentCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
            {urgentCount}
          </span>
          <span className="text-[10px] text-rose-700 block font-medium">Atención prioritaria hoy</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Completadas</span>
          <span className="text-2xl font-black text-emerald-600">
            {tasks.filter(t => t.completed).length}
          </span>
          <span className="text-[10px] text-emerald-700 block font-medium">Labores concluidas</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Efectividad</span>
          <span className="text-2xl font-black text-sky-600">
            {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 100}%
          </span>
          <span className="text-[10px] text-sky-700 block font-medium">Cumplimiento personal</span>
        </div>
      </div>

      {/* Main Task Manager Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewTask}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Tarea
            </button>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === 'all' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === 'pending' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendientes ({pendingTasks.length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === 'completed' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completadas
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3 pt-2">
          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No hay tareas en esta vista.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                  task.completed
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : task.priority === 'urgente'
                    ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-emerald-500 bg-white" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      <Badge
                        variant={
                          task.priority === 'urgente' ? 'danger' :
                          task.priority === 'alta' ? 'warning' : 'default'
                        }
                        size="xs"
                      >
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="cyan" size="xs">
                        {task.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {task.relatedAnimalTag && (
                        <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-emerald-800 font-bold">
                          {task.relatedAnimalTag}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Límite: <strong className="text-slate-800">{task.dueDate}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        Asignado a: <strong className="text-slate-800">{task.assignedTo}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Eliminar Tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
