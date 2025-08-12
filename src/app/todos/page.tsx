"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calendar, Home, User } from "lucide-react";
import { toast } from "sonner";
import type { Todo, CreateTodoInput, ApiResponse } from "@/lib/types";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState<CreateTodoInput>({ title: "", description: "" });
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchTodos();
    }
  }, [session]);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      const data: ApiResponse<Todo[]> = await response.json();
      
      if (data.success && data.data) {
        setTodos(data.data);
      } else {
        toast.error(data.error || "Failed to fetch todos");
      }
    } catch {
      toast.error("Error fetching todos");
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    setIsAddingTodo(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      });

      const data: ApiResponse<Todo> = await response.json();
      
      if (data.success && data.data) {
        setTodos(prev => [data.data!, ...prev]);
        setNewTodo({ title: "", description: "" });
        toast.success("Todo created successfully");
      } else {
        toast.error(data.error || "Failed to create todo");
      }
    } catch {
      toast.error("Error creating todo");
    } finally {
      setIsAddingTodo(false);
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      const data: ApiResponse<Todo> = await response.json();
      
      if (data.success && data.data) {
        setTodos(prev => prev.map(todo => 
          todo._id === todoId ? data.data! : todo
        ));
        toast.success(`Todo ${!completed ? "completed" : "uncompleted"}`);
      } else {
        toast.error(data.error || "Failed to update todo");
      }
    } catch {
      toast.error("Error updating todo");
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      });

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setTodos(prev => prev.filter(todo => todo._id !== todoId));
        toast.success("Todo deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete todo");
      }
    } catch {
      toast.error("Error deleting todo");
    }
  };

  if (isPending || loading) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-card p-6 flex flex-col">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h2 className="font-semibold">Account</h2>
          </div>
          
          <UserProfile />
          
          <Separator />
          
          <nav className="space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </nav>
          
          <Separator />
          
          {/* Todo Statistics */}
          {todos.length > 0 && (
            <div className="space-y-3">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl py-8 px-6">
          <div className="mb-8">
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
                <Button type="submit" disabled={isAddingTodo || !newTodo.title.trim()}>
                  {isAddingTodo ? "Adding..." : "Add Todo"}
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
                <Card key={todo._id} className={todo.completed ? "opacity-75" : ""}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo._id, todo.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                              {todo.title}
                            </h3>
                            <Badge variant={todo.completed ? "secondary" : "default"}>
                              {todo.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          {todo.description && (
                            <p className={`text-sm text-muted-foreground ${todo.completed ? "line-through" : ""}`}>
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                            </div>
                            {todo.updatedAt !== todo.createdAt && (
                              <div className="flex items-center gap-1">
                                <span>Updated: {new Date(todo.updatedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteTodo(todo._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}