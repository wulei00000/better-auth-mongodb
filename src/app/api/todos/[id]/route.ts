import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";
import { UpdateTodoSchema, type Todo, type ApiResponse } from "@/lib/types";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const client = new MongoClient(process.env.MONGODB_URI);
const database = client.db(process.env.MONGODB_DB || "better-auth");
const todosCollection = database.collection<Omit<Todo, "_id"> & { _id?: ObjectId }>("todos");

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Todo>>> {
  try {
    // Verify session server-side
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid todo ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input with Zod schema
    const validatedData = UpdateTodoSchema.parse(body);

    // Update with user ownership check - CRITICAL for security
    const result = await todosCollection.findOneAndUpdate(
      { 
        _id: new ObjectId(id),
        userId: session.user.id // Ensure user can only update their own todos
      },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Todo not found or access denied" },
        { status: 404 }
      );
    }

    const updatedTodo: Todo = {
      ...result,
      _id: result._id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }
    
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    // Verify session server-side
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid todo ID" },
        { status: 400 }
      );
    }

    // Delete with user ownership check - CRITICAL for security
    const result = await todosCollection.deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id // Ensure user can only delete their own todos
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Todo not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}