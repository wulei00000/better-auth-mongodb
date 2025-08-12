import { TodosClient } from "./todos-client";
import { getServerSession } from "@/lib/auth-server";
import { getTodos } from "@/lib/actions";

export default async function DashboardPage() {
  // Server-side authentication check
  const session = await getServerSession();
  
  // Fetch todos server-side 
  const initialTodos = await getTodos();

  return <TodosClient initialTodos={initialTodos} session={session} />;
}