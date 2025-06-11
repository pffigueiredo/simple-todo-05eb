
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type GetTodoInput } from '../schema';
import { getTodo } from '../handlers/get_todo';

describe('getTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get a todo by id', async () => {
    // Create a test todo first
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'A todo for testing',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    const input: GetTodoInput = {
      id: createdTodo.id
    };

    const result = await getTodo(input);

    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Test Todo');
    expect(result.description).toEqual('A todo for testing');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should get a todo with null description', async () => {
    // Create a test todo with null description
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Todo without description',
        description: null,
        completed: true
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];

    const input: GetTodoInput = {
      id: createdTodo.id
    };

    const result = await getTodo(input);

    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Todo without description');
    expect(result.description).toBeNull();
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent todo', async () => {
    const input: GetTodoInput = {
      id: 999 // Non-existent ID
    };

    expect(getTodo(input)).rejects.toThrow(/todo with id 999 not found/i);
  });
});
