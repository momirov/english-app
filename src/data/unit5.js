export const unit5 = {
  id: 'unit5',
  number: 5,
  title: 'Food and health',
  color: '#16a085',
  lessons: [
    {
      id: 'unit5-vocab1',
      type: 'vocabulary',
      title: 'Food',
      canDo: 'I can talk about food and drink.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'apple', back: '🍎 a round red or green fruit' },
            { front: 'bread', back: '🍞 food made from flour and baked' },
            { front: 'cheese', back: '🧀 a food made from milk' },
            { front: 'chicken', back: '🍗 meat from a bird' },
            { front: 'rice', back: '🍚 small white grains, common in Asia' },
            { front: 'pasta', back: '🍝 Italian food made from flour and water' },
            { front: 'salad', back: '🥗 a mix of raw vegetables' },
            { front: 'orange juice', back: '🍊 a drink made from oranges' },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'apple', right: '🍎' },
            { left: 'bread', right: '🍞' },
            { left: 'cheese', right: '🧀' },
            { left: 'chicken', right: '🍗' },
            { left: 'rice', right: '🍚' },
            { left: 'salad', right: '🥗' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Pasta is a food from ___.',
          options: ['China', 'Spain', 'Italy', 'France'],
          answer: 'Italy',
        },
      ],
    },
    {
      id: 'unit5-grammar1',
      type: 'grammar',
      title: 'Countable and uncountable nouns',
      canDo: 'I can identify countable and uncountable nouns.',
      exercises: [
        {
          type: 'multiple-choice',
          question: '"Bread" is ___.',
          options: ['countable', 'uncountable', 'a verb', 'an adjective'],
          answer: 'uncountable',
        },
        {
          type: 'multiple-choice',
          question: '"Apple" is ___.',
          options: ['uncountable', 'countable', 'a verb', 'an adjective'],
          answer: 'countable',
        },
        {
          type: 'true-false',
          statement: 'You can say "three breads".',
          answer: false,
        },
        {
          type: 'true-false',
          statement: 'You can say "two apples".',
          answer: true,
        },
        {
          type: 'matching',
          pairs: [
            { left: 'apple', right: 'countable' },
            { left: 'water', right: 'uncountable' },
            { left: 'egg', right: 'countable' },
            { left: 'rice', right: 'uncountable' },
            { left: 'sandwich', right: 'countable' },
          ],
        },
      ],
    },
    {
      id: 'unit5-grammar2',
      type: 'grammar',
      title: 'much, many, a lot of',
      canDo: 'I can use much, many and a lot of correctly.',
      exercises: [
        {
          type: 'fill-blank',
          template: 'There is ___ water in the bottle.',
          wordBank: ['many', 'much', 'a few', 'several'],
          answer: 'much',
        },
        {
          type: 'fill-blank',
          template: 'There are ___ apples in the bag.',
          wordBank: ['much', 'many', 'a little', 'a lot'],
          answer: 'many',
        },
        {
          type: 'fill-blank',
          template: 'She eats ___ vegetables every day.',
          wordBank: ['much', 'many', 'a lot of', 'a little'],
          answer: 'a lot of',
        },
        {
          type: 'multiple-choice',
          question: 'How ___ sugar do you want?',
          options: ['many', 'much', 'a lot', 'lots'],
          answer: 'much',
        },
        {
          type: 'multiple-choice',
          question: 'How ___ eggs do we need?',
          options: ['much', 'many', 'a lot', 'lots'],
          answer: 'many',
        },
        {
          type: 'true-false',
          statement: 'We use "much" with countable nouns.',
          answer: false,
        },
        {
          type: 'true-false',
          statement: 'We use "many" with countable nouns.',
          answer: true,
        },
      ],
    },
  ],
};
