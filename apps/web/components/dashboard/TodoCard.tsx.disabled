"use client";

import React, { useState, KeyboardEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { useReminders, useCreateReminder, useCompleteReminder, useDeleteReminder } from "@/lib/hooks/useDashboard";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * Todo Card Component
 *
 * Displays todo list with inline add functionality
 * Features:
 * - Inline "Add Todo" input with Enter key handler
 * - Todo items with checkbox, title, and due date badge
 * - Complete checkbox handler with optimistic UI update
 * - Fade-out animation on completion (2 seconds) then remove from DOM
 * - Due date picker with shadcn Calendar component
 * - Overdue highlighting (red background, Overdue badge) for past due dates
 */
export function TodoCard() {
  const { toast } = useToast();
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const { data: remindersData, isLoading, error } = useReminders({
    completed: false,
    first: 20,
  });
  const { mutate: createReminder } = useCreateReminder();
  const { mutate: completeReminder } = useCompleteReminder();
  const { mutate: deleteReminder } = useDeleteReminder();

  const todos = remindersData?.edges.map((edge) => edge.node) || [];

  const handleAddTodo = () => {
    if (!newTodoTitle.trim()) {
      return;
    }

    createReminder(
      {
        title: newTodoTitle,
        dueDate: selectedDate ? selectedDate.toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: "MEDIUM",
      },
      {
        onSuccess: () => {
          setNewTodoTitle("");
          setSelectedDate(undefined);
          toast({
            title: "Todo added",
            description: "Your todo has been added to the list.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add todo. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleCompleteTodo = (id: string, title: string) => {
    // Add to completing set for animation
    setCompletingIds((prev) => new Set(prev).add(id));

    // Wait 2 seconds for animation, then mark as complete
    setTimeout(() => {
      completeReminder(id, {
        onSuccess: () => {
          toast({
            title: "Todo completed",
            description: `"${title}" has been marked as complete.`,
          });
          // Remove from completing set after mutation succeeds
          setCompletingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to complete todo.",
            variant: "destructive",
          });
          // Remove from completing set on error
          setCompletingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        },
      });
    }, 2000);
  };

  const handleDeleteTodo = (id: string, title: string) => {
    deleteReminder(id, {
      onSuccess: () => {
        toast({
          title: "Todo deleted",
          description: `"${title}" has been deleted.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete todo.",
          variant: "destructive",
        });
      },
    });
  };

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    return isPast(due) && !isToday(due);
  };

  const getDueDateBadge = (dueDate: string) => {
    const due = new Date(dueDate);

    if (isToday(due)) {
      return (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          Today
        </Badge>
      );
    }

    if (isOverdue(dueDate)) {
      return (
        <Badge variant="destructive" className="text-xs">
          Overdue
        </Badge>
      );
    }

    const daysUntil = differenceInDays(due, new Date());
    if (daysUntil === 1) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          Tomorrow
        </Badge>
      );
    }

    if (daysUntil <= 7) {
      return (
        <Badge variant="outline" className="text-xs">
          {daysUntil} days
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs">
        {format(due, "MMM dd")}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">My Todos</CardTitle>
          <CardDescription>Your action items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Failed to load todos. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="todo-card" className="rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">My Todos</CardTitle>
        <CardDescription>
          {todos.length > 0 ? `${todos.length} pending items` : "No todos yet"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Add Todo Input */}
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Add a new action item..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 min-h-[44px] min-w-[44px]"
                aria-label="Select due date"
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleAddTodo}
            size="icon"
            className="h-11 w-11 min-h-[44px] min-w-[44px]"
            disabled={!newTodoTitle.trim()}
            aria-label="Add todo"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {selectedDate && (
          <div className="mb-4 text-xs text-gray-500">
            Due: {format(selectedDate, "MMM dd, yyyy")}
          </div>
        )}

        {/* Todo List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              All caught up
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              No action items
            </p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {todos.map((todo) => {
              const isCompleting = completingIds.has(todo.id);
              const todoOverdue = isOverdue(todo.dueDate);

              return (
                <div
                  key={todo.id}
                  data-testid="todo-item"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-500",
                    todoOverdue && "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
                    !todoOverdue && "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
                    isCompleting && "opacity-0 scale-95"
                  )}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => handleCompleteTodo(todo.id, todo.title)}
                    disabled={isCompleting}
                  />

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className={cn(
                          "text-sm truncate",
                          isCompleting && "line-through",
                          todoOverdue && "text-red-900 dark:text-red-100"
                        )}>
                          {todo.title}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        {todo.title}
                      </TooltipContent>
                    </Tooltip>
                    {todo.description && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {todo.description}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          {todo.description}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Due Date Badge */}
                  {getDueDateBadge(todo.dueDate)}

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 min-h-[44px] min-w-[44px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteTodo(todo.id, todo.title)}
                    aria-label="Delete todo"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              );
              })}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
