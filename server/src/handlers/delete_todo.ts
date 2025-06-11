
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTodo = async (input: DeleteTodoInput): Promise<{ success: boolean }> => {
  try {
    // Delete the todo with the specified id
    const result = await db.delete(todosTable)
      .where(eq(todosTable.id, input.id))
      .execute();

    // Check if any rows were affected (todo existed and was deleted)
    // Handle null case for rowCount
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Todo deletion failed:', error);
    throw error;
  }
};
