export const unit6 = {
  id: 'unit6',
  number: 6,
  title: 'Sport',
  color: '#8e44ad',
  lessons: [
    {
      id: 'unit6-vocab1',
      type: 'vocabulary',
      title: 'Sports',
      canDo: 'I can talk about sports and say which sports I like.',
      exercises: [
        {
          type: 'matching',
          pairs: [
            { left: 'football', right: '⚽ kick a ball into a goal' },
            { left: 'tennis', right: '🎾 hit a ball over a net with a racket' },
            { left: 'swimming', right: '🏊 move through water' },
            { left: 'basketball', right: '🏀 throw a ball into a hoop' },
            { left: 'cycling', right: '🚴 ride a bicycle' },
            { left: 'gymnastics', right: '🤸 do acrobatic movements' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'You need a racket to play ___.',
          options: ['football', 'swimming', 'tennis', 'cycling'],
          answer: 'tennis',
        },
        {
          type: 'multiple-choice',
          question: 'In ___, you score by getting the ball in the hoop.',
          options: ['football', 'basketball', 'tennis', 'swimming'],
          answer: 'basketball',
        },
      ],
    },
    {
      id: 'unit6-grammar1',
      type: 'grammar',
      title: 'Past simple — regular verbs',
      canDo: 'I can use the past simple to talk about finished actions.',
      exercises: [
        {
          type: 'fill-blank',
          template: 'She ___ tennis yesterday. (play)',
          wordBank: ['play', 'plays', 'played', 'playing'],
          answer: 'played',
        },
        {
          type: 'fill-blank',
          template: 'They ___ the match last week. (watch)',
          wordBank: ['watch', 'watches', 'watched', 'watching'],
          answer: 'watched',
        },
        {
          type: 'fill-blank',
          template: 'He ___ 5 km in the race. (walk)',
          wordBank: ['walk', 'walks', 'walked', 'walking'],
          answer: 'walked',
        },
        {
          type: 'word-order',
          words: ['football', 'played', 'Saturday', 'on', 'we', '.'],
          answer: ['We', 'played', 'football', 'on', 'Saturday', '.'],
        },
        {
          type: 'word-order',
          words: ['team', 'the', 'match', 'won', 'the', '.'],
          answer: ['The', 'team', 'won', 'the', 'match', '.'],
        },
        {
          type: 'multiple-choice',
          question: 'The athlete ___ a world record yesterday.',
          options: ['break', 'breaks', 'broke', 'breaking'],
          answer: 'broke',
        },
      ],
    },
    {
      id: 'unit6-vocab2',
      type: 'vocabulary',
      title: 'Irregular verbs',
      canDo: 'I can use common irregular past simple forms.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'go', back: 'went' },
            { front: 'win', back: 'won' },
            { front: 'run', back: 'ran' },
            { front: 'swim', back: 'swam' },
            { front: 'see', back: 'saw' },
            { front: 'come', back: 'came' },
            { front: 'take', back: 'took' },
            { front: 'break', back: 'broke' },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'go', right: 'went' },
            { left: 'win', right: 'won' },
            { left: 'run', right: 'ran' },
            { left: 'swim', right: 'swam' },
            { left: 'see', right: 'saw' },
          ],
        },
        {
          type: 'fill-blank',
          template: 'She ___ to the gym yesterday. (go)',
          wordBank: ['go', 'goes', 'went', 'gone'],
          answer: 'went',
        },
        {
          type: 'fill-blank',
          template: 'Our team ___ the championship! (win)',
          wordBank: ['win', 'wins', 'won', 'winned'],
          answer: 'won',
        },
      ],
    },
  ],
};
