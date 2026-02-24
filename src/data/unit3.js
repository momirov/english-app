export const unit3 = {
  id: 'unit3',
  number: 3,
  title: 'Wild life',
  color: '#d35400',
  lessons: [
    {
      id: 'unit3-vocab1',
      type: 'vocabulary',
      title: 'Animals',
      canDo: 'I can name and describe wild animals.',
      exercises: [
        {
          type: 'matching',
          pairs: [
            { left: 'elephant', right: '🐘 very large animal with a trunk' },
            { left: 'lion', right: '🦁 big cat, king of the jungle' },
            { left: 'dolphin', right: '🐬 intelligent sea animal' },
            { left: 'eagle', right: '🦅 large bird that can fly very high' },
            { left: 'snake', right: '🐍 long reptile with no legs' },
            { left: 'giraffe', right: '🦒 very tall animal with a long neck' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Which animal lives in the sea?',
          options: ['lion', 'elephant', 'dolphin', 'eagle'],
          answer: 'dolphin',
        },
        {
          type: 'multiple-choice',
          question: 'Which animal is the tallest?',
          options: ['snake', 'giraffe', 'eagle', 'lion'],
          answer: 'giraffe',
        },
      ],
    },
    {
      id: 'unit3-grammar1',
      type: 'grammar',
      title: 'Superlatives',
      canDo: 'I can use superlative adjectives to compare more than two things.',
      exercises: [
        {
          type: 'fill-blank',
          template: 'The elephant is ___ land animal. (heavy)',
          wordBank: ['the heaviest', 'the most heavy', 'heavier', 'heavy'],
          answer: 'the heaviest',
        },
        {
          type: 'fill-blank',
          template: 'The cheetah is ___ land animal. (fast)',
          wordBank: ['faster', 'the fastest', 'most fast', 'the most fast'],
          answer: 'the fastest',
        },
        {
          type: 'multiple-choice',
          question: 'The blue whale is ___ animal in the world. (big)',
          options: ['bigger', 'the bigger', 'the biggest', 'most big'],
          answer: 'the biggest',
        },
        {
          type: 'multiple-choice',
          question: 'The Amazon is ___ river in the world. (long)',
          options: ['longer', 'the longer', 'most long', 'the longest'],
          answer: 'the longest',
        },
        {
          type: 'word-order',
          words: ['is', 'the', 'Africa', 'hottest', 'continent', 'the', '.'],
          answer: ['Africa', 'is', 'the', 'hottest', 'continent', '.'],
        },
      ],
    },
    {
      id: 'unit3-grammar2',
      type: 'grammar',
      title: 'can for ability',
      canDo: 'I can use can and can\'t to talk about ability.',
      exercises: [
        {
          type: 'true-false',
          statement: 'Dolphins can swim very fast.',
          answer: true,
        },
        {
          type: 'true-false',
          statement: 'Snakes can fly.',
          answer: false,
        },
        {
          type: 'true-false',
          statement: 'Eagles can\'t fly.',
          answer: false,
        },
        {
          type: 'multiple-choice',
          question: 'Birds ___ fly but fish cannot.',
          options: ['can\'t', 'can', 'are', 'have'],
          answer: 'can',
        },
        {
          type: 'multiple-choice',
          question: 'Elephants ___ jump very high.',
          options: ['can', 'are', 'can\'t', 'is'],
          answer: 'can\'t',
        },
        {
          type: 'fill-blank',
          template: 'Dolphins ___ communicate with sounds.',
          wordBank: ['can', "can't", 'are', 'have'],
          answer: 'can',
        },
      ],
    },
  ],
};
