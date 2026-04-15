import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import GrammarTable from './GrammarTable';
import { SessionProvider } from '../../collab/useSession.jsx';
import { CollabScope } from '../../collab/useCollabField.jsx';
import { createSessionManager } from '../../collab/session.js';
import { createMemoryTransportPair } from '../../collab/transports/memory.js';
import { MSG } from '../../collab/protocol.js';

const exercise = {
  type: 'grammar-table',
  title: 'Present simple: to be',
  rows: [
    { prompt: 'I', answer: 'am' },
    { prompt: 'He / She', answer: 'is' },
    { prompt: 'They', answer: 'are' },
  ],
};

describe('GrammarTable', () => {
  it('renders the title and input fields', () => {
    render(<GrammarTable exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByText('Present simple: to be')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('type here...')).toHaveLength(3);
  });

  it('shows Check answers button before checking', () => {
    render(<GrammarTable exercise={exercise} onAnswer={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Check answers' })).toBeInTheDocument();
  });

  it('calls onAnswer with proportional scoring for all correct', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<GrammarTable exercise={exercise} onAnswer={onAnswer} />);
    const inputs = screen.getAllByPlaceholderText('type here...');
    await user.type(inputs[0], 'am');
    await user.type(inputs[1], 'is');
    await user.type(inputs[2], 'are');
    await user.click(screen.getByRole('button', { name: 'Check answers' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onAnswer).toHaveBeenCalledWith(true, expect.objectContaining({
      proportional: { correct: 3, total: 3 },
    }));
  });

  it('calls onAnswer with proportional scoring for partial correct', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<GrammarTable exercise={exercise} onAnswer={onAnswer} />);
    const inputs = screen.getAllByPlaceholderText('type here...');
    await user.type(inputs[0], 'am');
    await user.type(inputs[1], 'wrong');
    await user.type(inputs[2], 'are');
    await user.click(screen.getByRole('button', { name: 'Check answers' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onAnswer).toHaveBeenCalledWith(true, expect.objectContaining({
      proportional: { correct: 2, total: 3 },
    }));
  });
});

describe('GrammarTable collab', () => {
  it('broadcasts answers when a cell is typed into', async () => {
    const pair = createMemoryTransportPair('R');
    const teacher = createSessionManager({ transport: pair.teacher, clientVersion: '1.0' });
    const student = createSessionManager({ transport: pair.student, clientVersion: '1.0' });
    await teacher.start({ as: 'teacher', roomCode: 'R' });
    await student.join({ roomCode: 'R' });
    await Promise.resolve();
    const received = [];
    student.on(MSG.INPUT, (p) => received.push(p));
    const ex = {
      type: 'grammar-table',
      title: 'be',
      rows: [{ prompt: 'I', answer: 'am' }, { prompt: 'You', answer: 'are' }],
    };
    render(
      <SessionProvider manager={teacher}>
        <CollabScope exerciseIndex={0}>
          <GrammarTable exercise={ex} onAnswer={() => {}} />
        </CollabScope>
      </SessionProvider>
    );
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'am' } });
    await new Promise(r => setTimeout(r, 10));
    expect(received.some(p => p.field === 'answers' && Array.isArray(p.value) && p.value[0] === 'am')).toBe(true);
  });
});
