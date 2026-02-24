export const unit2 = {
  id: 'unit2',
  number: 2,
  title: 'Days',
  color: '#27ae60',
  lessons: [
    {
      id: 'unit2-vocab1',
      type: 'vocabulary',
      title: 'Daily routines',
      canDo: 'I can talk about daily routines and times.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'get up', back: 'to leave your bed in the morning' },
            { front: 'have breakfast', back: 'to eat the first meal of the day' },
            { front: 'go to school', back: 'to travel to your place of education' },
            { front: 'have lunch', back: 'to eat a meal in the middle of the day' },
            { front: 'do homework', back: 'to complete school work at home' },
            { front: 'have dinner', back: 'to eat the main evening meal' },
            { front: 'go to bed', back: 'to get into bed to sleep' },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'get up', right: 'leave bed in the morning' },
            { left: 'have breakfast', right: 'eat the first meal' },
            { left: 'do homework', right: 'complete school work at home' },
            { left: 'have dinner', right: 'eat the evening meal' },
            { left: 'go to bed', right: 'get into bed to sleep' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'I ___ at 7 o\'clock every morning.',
          options: ['go to bed', 'get up', 'have dinner', 'do homework'],
          answer: 'get up',
        },
      ],
    },
    {
      id: 'unit2-grammar1',
      type: 'grammar',
      title: 'Present simple',
      canDo: 'I can use the present simple to talk about habits and routines.',
      exercises: [
        {
          type: 'fill-blank',
          template: 'She ___ breakfast at 7 am. (have)',
          wordBank: ['have', 'has', 'haves', 'having'],
          answer: 'has',
        },
        {
          type: 'fill-blank',
          template: 'They ___ to school by bus. (go)',
          wordBank: ['go', 'goes', 'went', 'going'],
          answer: 'go',
        },
        {
          type: 'fill-blank',
          template: 'He ___ his homework after school. (do)',
          wordBank: ['do', 'does', 'did', 'doing'],
          answer: 'does',
        },
        {
          type: 'multiple-choice',
          question: 'She ___ up at 6:30 every day.',
          options: ['get', 'gets', 'got', 'getting'],
          answer: 'gets',
        },
        {
          type: 'multiple-choice',
          question: 'They ___ dinner at 7 pm.',
          options: ['has', 'have', 'having', 'had'],
          answer: 'have',
        },
        {
          type: 'true-false',
          statement: 'We add -s to the verb with he, she, and it in present simple.',
          answer: true,
        },
      ],
    },
    {
      id: 'unit2-grammar2',
      type: 'grammar',
      title: 'Adverbs of frequency',
      canDo: 'I can use adverbs of frequency to say how often I do things.',
      exercises: [
        {
          type: 'multiple-choice',
          question: 'I ___ eat vegetables. (100% of the time)',
          options: ['never', 'sometimes', 'always', 'rarely'],
          answer: 'always',
        },
        {
          type: 'multiple-choice',
          question: 'She ___ goes to the cinema. (0% of the time)',
          options: ['always', 'usually', 'often', 'never'],
          answer: 'never',
        },
        {
          type: 'true-false',
          statement: 'Adverbs of frequency go after the main verb in a sentence.',
          answer: false,
        },
        {
          type: 'true-false',
          statement: '"Sometimes" means about 50% of the time.',
          answer: true,
        },
        {
          type: 'word-order',
          words: ['always', 'breakfast', 'have', 'I', '.'],
          answer: ['I', 'always', 'have', 'breakfast', '.'],
        },
        {
          type: 'multiple-choice',
          question: 'He ___ plays football — maybe twice a week.',
          options: ['always', 'often', 'never', 'rarely'],
          answer: 'often',
        },
      ],
    },
  ],
};
