import { useState, useCallback } from "react";
import { format } from "date-fns";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import type { Tasca, TaskStatus, TaskPriority } from "@/types";

interface UseCreateTaskFormProps {
  editingTask?: Tasca | null;
  onSubmit: (taskData: any) => void;
  onClose: () => void;
}

interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  folder_id?: string;
  is_today?: boolean;
}

export const useCreateTaskForm = ({ editingTask, onSubmit, onClose }: UseCreateTaskFormProps) => {
  const { getStatusOptions, getPriorityOptions } = usePropertyLabels();
  
  // Form state
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [status, setStatus] = useState<TaskStatus>(
    editingTask?.status || "pendent"
  );
  const [priority, setPriority] = useState<TaskPriority>(
    editingTask?.priority || "mitjana"
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    editingTask?.due_date ? new Date(editingTask.due_date) : undefined
  );
  const [folderId, setFolderId] = useState<string>(editingTask?.folder_id || "");
  const [isToday, setIsToday] = useState<boolean>(editingTask?.is_today || false);

  // Reset form when editing task changes
  const resetForm = useCallback(() => {
    setTitle(editingTask?.title || "");
    setDescription(editingTask?.description || "");
    setStatus(editingTask?.status || "pendent");
    setPriority(editingTask?.priority || "mitjana");
    setDueDate(editingTask?.due_date ? new Date(editingTask.due_date) : undefined);
    setFolderId(editingTask?.folder_id || "");
    setIsToday(editingTask?.is_today || false);
  }, [editingTask]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: TaskFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
      folder_id: folderId || undefined,
      is_today: isToday,
    };

    onSubmit(taskData);

    // Reset form only if not editing
    if (!editingTask) {
      setTitle("");
      setDescription("");
      setStatus("pendent");
      setPriority("mitjana");
      setDueDate(undefined);
      setFolderId("");
      setIsToday(false);
    }

    onClose();
  }, [title, description, status, priority, dueDate, folderId, isToday, editingTask, onSubmit, onClose]);

  return {
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    folderId,
    setFolderId,
    isToday,
    setIsToday,
    
    // Options
    statusOptions: getStatusOptions(),
    priorityOptions: getPriorityOptions(),
    
    // Actions
    handleSubmit,
    resetForm,
    
    // Computed
    isEditing: !!editingTask,
    isValid: title.trim().length > 0,
  };
};