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

    expect(received).toHaveLength(1);
    expect(received[0].path).toBe('/unit1/unit1-vocab1/2');
  });
});
