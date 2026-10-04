import React, { useState } from 'react';
import { TaskAssignment } from '../../types/livestock';
import { Modal } from '../common/Modal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskAssignment) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'sanidad' | 'reproduccion' | 'pesaje' | 'rotacion_potrero' | 'ordeño' | 'mantenimiento' | 'nutricion'>('sanidad');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'urgente' | 'alta' | 'media' | 'baja'>('alta');
  const [assignedTo, setAssignedTo] = useState('Carlos Mendoza (Mayordomo)');
  const [relatedAnimalTag, setRelatedAnimalTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const task: TaskAssignment = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      dueDate,
      priority,
      assignedTo: assignedTo.trim(),
      completed: false,
      relatedAnimalTag: relatedAnimalTag.trim().toUpperCase() || undefined
    };

    onSave(task);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Nueva Tarea de Campo / Mayordomía"
      subtitle="Programación de labores pecuarias para personal de finca"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Título de la Tarea *</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ej. Vacunación Lote Ceba, Reparar Cerca Potrero 3"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoría Operativa *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="sanidad">Sanidad & Tratamientos</option>
              <option value="reproduccion">Reproducción & Inseminación</option>
              <option value="rotacion_potrero">Rotación de Potrero</option>
              <option value="pesaje">Pesaje en Báscula</option>
              <option value="ordeño">Ordeño & Tanque</option>
              <option value="nutricion">Nutrición & Silos</option>
              <option value="mantenimiento">Mantenimiento de Cercas / Maquinaria</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Prioridad *</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="urgente">🔴 URGENTE (Hoy mismo)</option>
              <option value="alta">🟠 ALTA</option>
              <option value="media">🟡 MEDIA</option>
              <option value="baja">🟢 BAJA</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha Límite *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Responsable Asignado *</label>
            <input
              type="text"
              required
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              placeholder="Nombre del vaquero / técnico"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Arete Bovino Relacionado (Opcional)</label>
          <input
            type="text"
            value={relatedAnimalTag}
            onChange={e => setRelatedAnimalTag(e.target.value)}
            placeholder="ej. CO-104 (si aplica a un animal específico)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono uppercase focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Instrucciones Detalladas</label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detalles sobre dosis, herramientas a utilizar, potrero específico..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all"
          >
            Asignar Tarea
          </button>
        </div>
      </form>
    </Modal>
  );
};
