import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";
import { CreateTodoSchema, type Todo, type ApiResponse } from "@/lib/types";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const client = new MongoClient(process.env.MONGODB_URI);
const database = client.db(process.env.MONGODB_DB || "better-auth");
const todosCollection = database.collection<Omit<Todo, "_id"> & { _id?: ObjectId }>("todos");

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Todo[]>>> {
  try {
    // Verify session server-side
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Query todos with user ownership filter - CRITICAL for security
    const todos = await todosCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedTodos: Todo[] = todos.map(todo => ({
      ...todo,
      _id: todo._id!.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedTodos,
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Todo>>> {
  try {
    // Verify session server-side
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input with Zod schema
    const validatedData = CreateTodoSchema.parse(body);

    const now = new Date();
    const newTodo = {
      title: validatedData.title,
      description: validatedData.description || "",
      completed: false,
      userId: session.user.id, // Use verified session user ID
      createdAt: now,
      updatedAt: now,
    };

    const result = await todosCollection.insertOne(newTodo);

    const createdTodo: Todo = {
      ...newTodo,
      _id: result.insertedId.toString(),
    };

    return NextResponse.json({
      success: true,
      data: createdTodo,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }
    
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}