
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

// Test input
const testInput: DeleteTodoInput = {
  id: 1
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a todo first
    const createResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'A todo for testing deletion'
      })
      .returning()
      .execute();

    const todoId = createResult[0].id;

    // Delete the todo
    const result = await deleteTodo({ id: todoId });

    // Should return success
    expect(result.success).toBe(true);

    // Verify todo is deleted from database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should return false when todo does not exist', async () => {
    // Try to delete a non-existent todo
    const result = await deleteTodo({ id: 999 });

    // Should return false for success
    expect(result.success).toBe(false);
  });

  it('should not affect other todos when deleting', async () => {
    // Create multiple todos
    const createResults = await db.insert(todosTable)
      .values([
        { title: 'Todo 1', description: 'First todo' },
        { title: 'Todo 2', description: 'Second todo' },
        { title: 'Todo 3', description: 'Third todo' }
      ])
      .returning()
      .execute();

    const todoToDelete = createResults[1].id; // Delete the middle one

    // Delete one todo
    const result = await deleteTodo({ id: todoToDelete });

    expect(result.success).toBe(true);

    // Verify only the target todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    expect(remainingTodos.map(t => t.id)).not.toContain(todoToDelete);
    expect(remainingTodos.map(t => t.title)).toEqual(
      expect.arrayContaining(['Todo 1', 'Todo 3'])
    );
  });
});
