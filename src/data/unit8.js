export const unit8 = {
  id: 'unit8',
  number: 8,
  title: 'Going away',
  color: '#2c3e50',
  lessons: [
    {
      id: 'unit8-vocab1',
      type: 'vocabulary',
      title: 'Holiday vocabulary',
      canDo: 'I can talk about holidays and travel.',
      exercises: [
        {
          type: 'matching',
          pairs: [
            { left: 'passport', right: 'document you need to travel abroad' },
            { left: 'suitcase', right: 'large bag for travelling' },
            { left: 'hotel', right: 'place to stay when travelling' },
            { left: 'airport', right: 'place where planes land and take off' },
            { left: 'beach', right: 'sandy area next to the sea' },
            { left: 'souvenir', right: 'small gift to remember a place' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'You need a ___ to travel to another country.',
          options: ['suitcase', 'souvenir', 'passport', 'hotel'],
          answer: 'passport',
        },
        {
          type: 'multiple-choice',
          question: 'You sleep at a ___ when you travel.',
          options: ['beach', 'airport', 'passport', 'hotel'],
          answer: 'hotel',
        },
        {
          type: 'flashcard',
          cards: [
            { front: 'passport', back: 'document for international travel' },
            { front: 'suitcase', back: 'large bag for your clothes and things' },
            { front: 'hotel', back: 'place to stay on holiday' },
            { front: 'beach', back: 'sandy area by the sea' },
            { front: 'souvenir', back: 'gift to remember a place' },
          ],
        },
      ],
    },
    {
      id: 'unit8-grammar1',
      type: 'grammar',
      title: 'be going to',
      canDo: 'I can use "be going to" to talk about future plans.',
      exercises: [
        {
          type: 'fill-blank',
          template: 'We ___ visit Paris next summer.',
          wordBank: ['going to', 'are going to', 'is going to', 'go to'],
          answer: 'are going to',
        },
        {
          type: 'fill-blank',
          template: 'She ___ pack her suitcase tonight.',
          wordBank: ['are going to', 'is going to', 'going to', 'go to'],
          answer: 'is going to',
        },
        {
          type: 'fill-blank',
          template: 'I ___ buy a souvenir for my mum.',
          wordBank: ['is going to', 'are going to', 'am going to', 'go to'],
          answer: 'am going to',
        },
        {
          type: 'multiple-choice',
          question: 'They ___ fly to Spain tomorrow.',
          options: ['is going to', 'are going to', 'going to', 'go to'],
          answer: 'are going to',
        },
        {
          type: 'word-order',
          words: ['visit', 'to', 'we', 'going', 'are', 'beach', 'the', '.'],
          answer: ['We', 'are', 'going', 'to', 'visit', 'the', 'beach', '.'],
        },
        {
          type: 'true-false',
          statement: '"Be going to" is used to talk about future plans.',
          answer: true,
        },
      ],
    },
    {
      id: 'unit8-grammar2',
      type: 'grammar',
      title: 'will / won\'t',
      canDo: "I can use will and won't to make predictions about the future.",
      exercises: [
        {
          type: 'multiple-choice',
          question: 'I think it ___ rain tomorrow.',
          options: ["won't", 'will', "isn't", 'not'],
          answer: 'will',
        },
        {
          type: 'multiple-choice',
          question: 'She ___ be late — she always arrives on time.',
          options: ["won't", 'will', "isn't", 'not'],
          answer: "won't",
        },
        {
          type: 'true-false',
          statement: '"Will" is the same for all persons (I, you, he, she, etc.).',
          answer: true,
        },
        {
          type: 'true-false',
          statement: '"Won\'t" is a short form of "will not".',
          answer: true,
        },
        {
          type: 'fill-blank',
          template: 'The weather ___ be great — it\'s always sunny there!',
          wordBank: ["won't", 'will', "isn't going to", 'not'],
          answer: 'will',
        },
        {
          type: 'fill-blank',
          template: "He ___ forget his passport — he's very organised.",
          wordBank: ['will', "won't", 'not', "doesn't"],
          answer: "won't",
        },
        {
          type: 'word-order',
          words: ['love', 'will', 'you', 'holiday', 'the', '!'],
          answer: ['You', 'will', 'love', 'the', 'holiday', '!'],
        },
      ],
    },
  ],
};
