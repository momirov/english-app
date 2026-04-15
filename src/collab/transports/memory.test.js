import { describe, it, expect, vi } from 'vitest';
import { createMemoryTransportPair } from './memory.js';

describe('MemoryTransport', () => {
  it('creates a paired teacher+student handle with the same room code', async () => {
    const { teacher: tPromise, student: sPromise } = createMemoryTransportPair('ROOM-1');
    const teacher = await tPromise.createRoom();
    const student = await sPromise.joinRoom('ROOM-1');
    expect(teacher.roomCode).toBe('ROOM-1');
    expect(student.roomCode).toBe('ROOM-1');
    expect(teacher.role).toBe('teacher');
    expect(student.role).toBe('student');
  });

  it('relays messages from one side to the other', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const student = await pair.student.joinRoom('R');
    const received = vi.fn();
    student.onMessage(received);
    teacher.send({ hello: 'world' });
    expect(received).toHaveBeenCalledWith({ hello: 'world' });
  });

  it('fires peer-state connected when both sides are ready', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const handler = vi.fn();
    teacher.onPeerState(handler);
    await pair.student.joinRoom('R');
    expect(handler).toHaveBeenCalledWith('connected');
  });

  it('fires disconnected on close', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const student = await pair.student.joinRoom('R');
    const handler = vi.fn();
    student.onPeerState(handler);
    teacher.close();
    expect(handler).toHaveBeenCalledWith('disconnected');
  });

  it('unsubscribes correctly', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const student = await pair.student.joinRoom('R');
    const handler = vi.fn();
    const unsub = student.onMessage(handler);
    unsub();
    teacher.send({ a: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('send after close is a no-op', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = await pair.teacher.createRoom();
    const student = await pair.student.joinRoom('R');
    const received = vi.fn();
    student.onMessage(received);
    teacher.close();
    teacher.send({ a: 1 });
    expect(received).not.toHaveBeenCalled();
  });
});
