"use client";

import { useState, useTransition } from "react";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Plus, Trash2, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import type { Todo, CreateTodoInput } from "@/lib/types";
import { getTodos, createTodoFromData, updateTodo, deleteTodo } from "@/lib/actions";

interface TodosClientProps {
  initialTodos: Todo[];
  session: { user: { id: string; name?: string; email: string } };
}

export function TodosClient({ initialTodos }: TodosClientProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState<CreateTodoInput>({ title: "", description: "" });
  const [isPending, startTransition] = useTransition();

  const fetchTodos = async () => {
    try {
      const todosData = await getTodos();
      setTodos(todosData);
    } catch {
      toast.error("Error fetching todos");
    }
  };

  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    startTransition(async () => {
      try {
        await createTodoFromData(newTodo);
        setNewTodo({ title: "", description: "" });
        toast.success("Todo created successfully");
        await fetchTodos();
      } catch {
        toast.error("Error creating todo");
      }
    });
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    startTransition(async () => {
      try {
        await updateTodo(todoId, { completed: !completed });
        toast.success(`Todo ${!completed ? "completed" : "uncompleted"}`);
        await fetchTodos();
      } catch {
        toast.error("Error updating todo");
      }
    });
  };

  const handleDeleteTodo = async (todoId: string) => {
    startTransition(async () => {
      try {
        await deleteTodo(todoId);
        toast.success("Todo deleted successfully");
        await fetchTodos();
      } catch {
        toast.error("Error deleting todo");
      }
    });
  };

  const AppSidebar = () => (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <User className="h-5 w-5" />
          <h2 className="font-semibold">Better Auth MongoDB</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="px-2">
          <UserProfile />
          
          {/* Todo Statistics */}
          {todos.length > 0 && (
            <div className="space-y-3 mt-4 px-2">
              <h3 className="font-medium text-sm">Statistics</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total todos</span>
                  <Badge variant="outline">{todos.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="default">{todos.filter(t => !t.completed).length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="secondary">{todos.filter(t => t.completed).length}</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-4 p-4 border-b">
          <SidebarTrigger />
          <h1 className="font-semibold">My Todos</h1>
        </div>

        <div className="container mx-auto max-w-4xl py-8 px-6">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold mb-2">My Todos</h1>
            <p className="text-muted-foreground">Manage your personal tasks</p>
          </div>

          {/* Add Todo Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Todo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createTodo} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter todo title..."
                    value={newTodo.title}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter todo description..."
                    value={newTodo.description}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={isPending || !newTodo.title.trim()}>
                  {isPending ? "Adding..." : "Add Todo"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Todos List */}
          <div className="space-y-4">
            {todos.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No todos yet. Create your first todo above!
                </CardContent>
              </Card>
            ) : (
              todos.map((todo) => (
                <Card key={todo._id} className={todo.completed ? "opacity-70" : ""}>
                  <CardContent className="px-6">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo._id, todo.completed)}
                        className="mt-1 mr-2 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className={`font-semibold leading-tight ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                            {todo.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTodo(todo._id)}
                            className="h-6 w-6 p-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {todo.description && (
                          <p className={`text-sm mb-2 ${todo.completed ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created {new Date(todo.createdAt).toLocaleDateString()}</span>
                          </div>
                          {todo.updatedAt !== todo.createdAt && (
                            <span>• Updated {new Date(todo.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}