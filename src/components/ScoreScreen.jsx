import { useState } from 'react';

function formatReport(lessonTitle, score, total, answers) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const lines = [
    `Lesson: ${lessonTitle}`,
    `Score: ${score}/${total} (${pct}%)`,
    `Date: ${date}`,
    '',
  ];

  answers.forEach(({ exercise, correct, detail }, i) => {
    const mark = correct ? '✓' : '✗';
    const n = i + 1;

    switch (exercise.type) {
      case 'multiple-choice':
        lines.push(`${n}. ${detail.question}`);
        lines.push(`   ${mark} ${detail.studentAnswer}${!correct ? ` (correct: ${detail.correctAnswer})` : ''}`);
        break;

      case 'fill-blank':
        lines.push(`${n}. ${detail.template}`);
        lines.push(`   ${mark} ${detail.studentAnswer}${!correct ? ` (correct: ${detail.correctAnswer})` : ''}`);
        break;

      case 'true-false':
        lines.push(`${n}. ${detail.statement}`);
        lines.push(`   ${mark} ${detail.studentAnswer ? 'True' : 'False'}${!correct ? ` (correct: ${detail.correctAnswer ? 'True' : 'False'})` : ''}`);
        break;

      case 'matching':
        lines.push(`${n}. Match the items:`);
        detail.pairs.forEach((p) => {
          const got = detail.studentMatches[p.left];
          const ok = got === p.right;
          lines.push(`   ${ok ? '✓' : '✗'} ${p.left} → ${got || '?'}${!ok ? ` (correct: ${p.right})` : ''}`);
        });
        break;

      case 'word-order':
        lines.push(`${n}. Put in order:`);
        lines.push(`   ${mark} "${detail.studentAnswer}"${!correct ? `\n   (correct: "${detail.correctAnswer}")` : ''}`);
        break;

      case 'grammar-table':
        lines.push(`${n}. ${detail.title}`);
        detail.rows.forEach((row, j) => {
          const stu = detail.studentAnswers[j];
          const ok = stu.trim().toLowerCase() === row.answer.toLowerCase();
          lines.push(`   ${ok ? '✓' : '✗'} ${row.prompt}: ${stu || '(empty)'}${!ok ? ` (correct: ${row.answer})` : ''}`);
        });
        break;

      case 'flashcard':
        lines.push(`${n}. Flashcards — ${detail.cards.length} cards reviewed ✓`);
        break;

      default:
        lines.push(`${n}. Exercise ${n}: ${mark}`);
    }

    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

export default function ScoreScreen({ score, total, lessonTitle, answers = [], onRetry, onBack }) {
  const [copied, setCopied] = useState(false);
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);

  let emoji, msg;
  if (pct === 100) { emoji = '🏆'; msg = 'Perfect score! Amazing work!'; }
  else if (pct >= 70) { emoji = '🌟'; msg = 'Great job! Keep it up!'; }
  else if (pct >= 50) { emoji = '👍'; msg = 'Good effort! Try again to improve.'; }
  else { emoji = '💪'; msg = 'Keep practising — you can do it!'; }

  async function handleShare() {
    const text = formatReport(lessonTitle, score, total, answers);
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="score-screen">
      <div className="score-emoji">{emoji}</div>
      <h2 className="score-title">{lessonTitle}</h2>
      <div className="score-circle">
        <span className="score-number">{score}</span>
        <span className="score-denom">/ {total}</span>
      </div>
      <p className="score-pct">{pct}%</p>
      <p className="score-msg">{msg}</p>
      <div className="score-actions">
        <button className="btn-secondary" onClick={onRetry}>↩ Try again</button>
        <button className="btn-primary" onClick={onBack}>← Back to unit</button>
      </div>
      <button className="btn-share" onClick={handleShare}>
        {copied ? 'Copied!' : '↑ Share results'}
      </button>
    </div>
  );
}
