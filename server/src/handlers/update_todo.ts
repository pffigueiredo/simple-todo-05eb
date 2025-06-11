
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput, type Todo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTodo = async (input: UpdateTodoInput): Promise<Todo> => {
  try {
    // Build update values object, excluding id and only including defined fields
    const updateValues: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateValues.title = input.title;
    }
    
    if (input.description !== undefined) {
      updateValues.description = input.description;
    }
    
    if (input.completed !== undefined) {
      updateValues.completed = input.completed;
    }

    // Update the todo record
    const result = await db.update(todosTable)
      .set(updateValues)
      .where(eq(todosTable.id, input.id))
      .returning()
      .execute();

    // Check if todo was found and updated
    if (result.length === 0) {
      throw new Error(`Todo with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Todo update failed:', error);
    throw error;
  }
};
