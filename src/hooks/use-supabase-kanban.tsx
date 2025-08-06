'use client';

import { useEffect } from 'react';
import { useTaskStore } from '@/features/kanban/utils/store';

/**
 * Hook to initialize Kanban data from Supabase
 * Call this in components that need to load Kanban data
 */
export function useSupabaseKanban() {
  const { loadTasks, loadColumns } = useTaskStore();

  useEffect(() => {
    const initializeKanbanData = async () => {
      try {
        // Load both columns and tasks from Supabase
        await Promise.all([loadColumns(), loadTasks()]);
      } catch (error) {
        console.error('Error initializing Kanban data:', error);
      }
    };

    initializeKanbanData();
  }, [loadTasks, loadColumns]);

  return {
    // You can return additional utilities here if needed
    refreshData: async () => {
      await Promise.all([loadColumns(), loadTasks()]);
    }
  };
}
