
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();

    expect(result).toEqual([]);
  });

  it('should return all todos', async () => {
    // Create test todos
    await db.insert(todosTable)
      .values([
        {
          title: 'First Todo',
          description: 'First description',
          completed: false
        },
        {
          title: 'Second Todo',
          description: null,
          completed: true
        }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    
    // Verify todo structure
    result.forEach(todo => {
      expect(todo.id).toBeDefined();
      expect(typeof todo.title).toBe('string');
      expect(typeof todo.completed).toBe('boolean');
      expect(todo.created_at).toBeInstanceOf(Date);
      expect(todo.updated_at).toBeInstanceOf(Date);
    });

    // Check specific todos
    const titles = result.map(todo => todo.title);
    expect(titles).toContain('First Todo');
    expect(titles).toContain('Second Todo');
  });

  it('should return todos ordered by created_at desc', async () => {
    // Create todos with slight delay to ensure different timestamps
    await db.insert(todosTable)
      .values({
        title: 'First Created',
        description: 'Created first',
        completed: false
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(todosTable)
      .values({
        title: 'Second Created',
        description: 'Created second',
        completed: false
      })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    // Most recently created should be first
    expect(result[0].title).toEqual('Second Created');
    expect(result[1].title).toEqual('First Created');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });
});
