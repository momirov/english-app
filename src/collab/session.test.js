import { describe, it, expect, vi } from 'vitest';
import { createSessionManager } from './session.js';
import { createMemoryTransportPair } from './transports/memory.js';
import { MSG } from './protocol.js';

function mkPair(code = 'R') {
  const pair = createMemoryTransportPair(code);
  return {
    teacher: createSessionManager({ transport: pair.teacher, clientVersion: '1.0' }),
    student: createSessionManager({ transport: pair.student, clientVersion: '1.0' }),
  };
}

describe('SessionManager', () => {
  it('starts in idle status', () => {
    const { teacher } = mkPair();
    expect(teacher.getStatus()).toBe('idle');
    expect(teacher.isActive).toBe(false);
  });

  it('transitions to connected after hello exchange', async () => {
    const { teacher, student } = mkPair('CODE');
    await teacher.start({ as: 'teacher', roomCode: 'CODE' });
    await student.join({ roomCode: 'CODE' });
    // Wait a microtask for hello messages to cross.
    await Promise.resolve();
    await Promise.resolve();
    expect(teacher.getStatus()).toBe('connected');
    expect(student.getStatus()).toBe('connected');
    expect(teacher.isActive).toBe(true);
  });

  it('broadcast sends typed messages to peer', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    const handler = vi.fn();
    student.on(MSG.INPUT, handler);
    teacher.broadcast(MSG.INPUT, { exerciseIndex: 0, field: 'value', value: 'hi' });
    await Promise.resolve();
    expect(handler).toHaveBeenCalledWith({ exerciseIndex: 0, field: 'value', value: 'hi' });
  });

  it('drops malformed incoming messages silently', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    const handler = vi.fn();
    student.on(MSG.INPUT, handler);
    // Send a raw malformed payload via the underlying transport.
    teacher._debug_sendRaw({ not: 'a valid message' });
    await Promise.resolve();
    expect(handler).not.toHaveBeenCalled();
  });

  it('end() closes and goes idle', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    teacher.end();
    expect(teacher.getStatus()).toBe('idle');
  });

  it('peer disconnect sets peer-gone', async () => {
    const { teacher, student } = mkPair('X');
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    student.end();
    await Promise.resolve();
    expect(teacher.getStatus()).toBe('peer-gone');
  });

  it('notifies status subscribers', async () => {
    const { teacher, student } = mkPair('X');
    const statusChanges = [];
    teacher.onStatusChange((s) => statusChanges.push(s));
    await teacher.start({ as: 'teacher', roomCode: 'X' });
    await student.join({ roomCode: 'X' });
    await Promise.resolve();
    expect(statusChanges).toContain('connecting');
    expect(statusChanges).toContain('connected');
  });
});
