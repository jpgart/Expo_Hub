import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Column } from '../components/board-column';
import { supabaseKanbanApi } from '@/lib/supabase-api';

export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

const defaultCols = [
  {
    id: 'TODO' as const,
    title: 'Todo'
  }
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]['id'];

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
};

export type State = {
  tasks: Task[];
  columns: Column[];
  draggedTask: string | null;
};

const initialTasks: Task[] = [
  {
    id: 'task1',
    status: 'TODO',
    title: 'Project initiation and planning'
  },
  {
    id: 'task2',
    status: 'TODO',
    title: 'Gather requirements from stakeholders'
  }
];

export type Actions = {
  addTask: (title: string, description?: string) => Promise<void>;
  addCol: (title: string) => Promise<void>;
  dragTask: (id: string | null) => void;
  removeTask: (id: string) => Promise<void>;
  removeCol: (id: UniqueIdentifier) => Promise<void>;
  setTasks: (updatedTask: Task[]) => void;
  setCols: (cols: Column[]) => void;
  updateCol: (id: UniqueIdentifier, newName: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  loadColumns: () => Promise<void>;
  updateTaskStatus: (
    id: string,
    newStatus: Status,
    columnId: string
  ) => Promise<void>;
};

export const useTaskStore = create<State & Actions>()((set, get) => ({
  tasks: initialTasks,
  columns: defaultCols,
  draggedTask: null,

  // Load data from Supabase
  loadTasks: async () => {
    try {
      const tasks = await supabaseKanbanApi.getTasks();
      set({ tasks });
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  },

  loadColumns: async () => {
    try {
      const columns = await supabaseKanbanApi.getColumns();
      if (columns.length > 0) {
        set({ columns });
      }
    } catch (error) {
      console.error('Error loading columns:', error);
    }
  },

  // Task operations
  addTask: async (title: string, description?: string) => {
    try {
      const taskData = {
        id: uuid(),
        title,
        description,
        status: 'TODO' as Status,
        column_id: 'TODO',
        position: get().tasks.length
      };

      const newTask = await supabaseKanbanApi.createTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, newTask]
      }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  },

  removeTask: async (id: string) => {
    try {
      await supabaseKanbanApi.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      }));
    } catch (error) {
      console.error('Error removing task:', error);
    }
  },

  updateTaskStatus: async (id: string, newStatus: Status, columnId: string) => {
    try {
      await supabaseKanbanApi.updateTask(id, {
        status: newStatus,
        column_id: columnId
      });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      }));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  },

  // Column operations
  addCol: async (title: string) => {
    try {
      const columnData = {
        id: title.toUpperCase(),
        title,
        position: get().columns.length
      };

      const newColumn = await supabaseKanbanApi.createColumn(columnData);
      set((state) => ({
        columns: [...state.columns, newColumn]
      }));
    } catch (error) {
      console.error('Error adding column:', error);
    }
  },

  updateCol: async (id: UniqueIdentifier, newName: string) => {
    try {
      await supabaseKanbanApi.updateColumn(id as string, { title: newName });
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === id ? { ...col, title: newName } : col
        )
      }));
    } catch (error) {
      console.error('Error updating column:', error);
    }
  },

  removeCol: async (id: UniqueIdentifier) => {
    try {
      await supabaseKanbanApi.deleteColumn(id as string);
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== id),
        tasks: state.tasks.filter((task) => task.status !== id)
      }));
    } catch (error) {
      console.error('Error removing column:', error);
    }
  },

  // Local state operations
  dragTask: (id: string | null) => set({ draggedTask: id }),
  setTasks: (newTasks: Task[]) => set({ tasks: newTasks }),
  setCols: (newCols: Column[]) => set({ columns: newCols })
}));
