export const unit1 = {
  id: 'unit1',
  number: 1,
  title: 'Towns and cities',
  color: '#2980b9',
  lessons: [
    {
      id: 'unit1-vocab1',
      type: 'vocabulary',
      title: 'Places in a town or city',
      canDo: 'I can talk about places in a town or city.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'square', back: 'a large open area in a town' },
            { front: 'museum', back: 'a place where you can see old or interesting things' },
            { front: 'castle', back: 'a large old building, sometimes with walls around it' },
            { front: 'market', back: 'a place where people buy and sell things' },
            { front: 'bridge', back: 'a structure that goes over a river or road' },
            { front: 'park', back: 'a green area in a city where people relax' },
            { front: 'cathedral', back: 'a large and important church' },
            { front: 'river', back: 'a long natural flow of water' },
          ],
        },
        {
          type: 'matching',
          pairs: [
            { left: 'square', right: 'large open area in a town' },
            { left: 'museum', right: 'place with old or interesting objects' },
            { left: 'castle', right: 'large old building with walls' },
            { left: 'market', right: 'place to buy and sell things' },
            { left: 'bridge', right: 'structure over a river' },
            { left: 'park', right: 'green area for relaxing' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'You can see paintings and old objects in a ___.',
          options: ['market', 'museum', 'park', 'bridge'],
          answer: 'museum',
        },
        {
          type: 'multiple-choice',
          question: 'People buy fruit and vegetables at a ___.',
          options: ['castle', 'museum', 'market', 'square'],
          answer: 'market',
        },
      ],
    },
    {
      id: 'unit1-grammar1',
      type: 'grammar',
      title: 'there is / there are',
      canDo: 'I can use there is and there are to describe a place.',
      exercises: [
        {
          type: 'fill-blank',
          template: '___ a big market in the town centre.',
          wordBank: ["There's", 'There are', 'Is there', 'Are there'],
          answer: "There's",
        },
        {
          type: 'fill-blank',
          template: '___ three museums in York.',
          wordBank: ["There's", 'There are', 'Is there', 'Are there'],
          answer: 'There are',
        },
        {
          type: 'fill-blank',
          template: '___ a castle near here?',
          wordBank: ["There's", 'There are', 'Is there', 'Are there'],
          answer: 'Is there',
        },
        {
          type: 'fill-blank',
          template: '___ any parks in this city?',
          wordBank: ["There's", 'There are', 'Is there', 'Are there'],
          answer: 'Are there',
        },
        {
          type: 'true-false',
          statement: 'We use "there is" with plural nouns.',
          answer: false,
        },
        {
          type: 'true-false',
          statement: 'We use "there are" with plural nouns.',
          answer: true,
        },
        {
          type: 'multiple-choice',
          question: '___ a river in the city.',
          options: ["There's", 'There are', 'Are there', 'Is there'],
          answer: "There's",
        },
      ],
    },
    {
      id: 'unit1-grammar2',
      type: 'grammar',
      title: 'Comparatives',
      canDo: 'I can compare two places using comparative adjectives.',
      exercises: [
        {
          type: 'multiple-choice',
          question: 'London is ___ than York. (big)',
          options: ['big', 'bigger', 'biggest', 'more big'],
          answer: 'bigger',
        },
        {
          type: 'multiple-choice',
          question: 'Oxford is ___ than London. (old)',
          options: ['old', 'older', 'oldest', 'more old'],
          answer: 'older',
        },
        {
          type: 'multiple-choice',
          question: 'The museum is ___ than the castle. (interesting)',
          options: ['interestinger', 'more interesting', 'most interesting', 'interesting'],
          answer: 'more interesting',
        },
        {
          type: 'word-order',
          words: ['is', 'Oxford', 'older', 'than', 'London', '.'],
          answer: ['Oxford', 'is', 'older', 'than', 'London', '.'],
        },
        {
          type: 'word-order',
          words: ['the', 'park', 'is', 'bigger', 'than', 'the', 'square', '.'],
          answer: ['The', 'park', 'is', 'bigger', 'than', 'the', 'square', '.'],
        },
        {
          type: 'fill-blank',
          template: 'Madrid is ___ than a small village. (busy)',
          wordBank: ['busyer', 'busier', 'more busy', 'busiier'],
          answer: 'busier',
        },
      ],
    },
  ],
};
