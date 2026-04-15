import { describe, it, expect, vi } from 'vitest';
import { createSessionManager } from './session.js';
import { createMemoryTransportPair } from './transports/memory.js';
import { MSG } from './protocol.js';

describe('snapshot exchange', () => {
  it('sends snapshot in response to hello from peer', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });

    // Teacher provides a snapshot builder.
    teacher.setSnapshotBuilder(() => ({
      path: '/unit1/unit1-vocab1/2',
      fields: { '2:value': 'hello' },
      submitted: {},
    }));

    // Student subscribes to incoming snapshot messages.
    const received = [];
    student.on(MSG.SNAPSHOT, (p) => received.push(p));

    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    await Promise.resolve();

    expect(received.length).toBeGreaterThanOrEqual(1);
    expect(received[0].path).toBe('/unit1/unit1-vocab1/2');
  });
});

describe('snapshot field fidelity', () => {
  it('includes recorded field values in the snapshot sent on hello', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    teacher.setSnapshotBuilder(() => ({ path: '/u/l/0' }));

    const snapshots = [];
    student.on(MSG.SNAPSHOT, (p) => snapshots.push(p));

    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    await Promise.resolve();

    // Teacher records a field value mid-session.
    teacher.broadcast(MSG.INPUT, { exerciseIndex: 0, field: 'value', value: 'hi' });
    await Promise.resolve();

    // The next hello should produce a snapshot containing that field.
    // Simulate a fresh hello from the peer using _debug_sendRaw.
    student._debug_sendRaw({ v: 1, type: MSG.HELLO, payload: { role: 'student', clientVersion: '1.0' } });
    await Promise.resolve();

    const latest = snapshots[snapshots.length - 1];
    expect(latest).toBeTruthy();
    expect(latest.path).toBe('/u/l/0');
    expect(latest.fields['0:value']).toBe('hi');
  });

  it('applies incoming snapshot fields as synthetic INPUT events', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();

    const inputs = [];
    student.on(MSG.INPUT, (p) => inputs.push(p));

    teacher._debug_sendRaw({
      v: 1,
      type: MSG.SNAPSHOT,
      payload: { path: '/u/l/0', fields: { '0:value': 'x', '1:selected': 'a' }, submitted: {} },
    });
    await Promise.resolve();

    expect(inputs).toContainEqual({ exerciseIndex: 0, field: 'value', value: 'x' });
    expect(inputs).toContainEqual({ exerciseIndex: 1, field: 'selected', value: 'a' });
  });
});
