export const unit7 = {
  id: 'unit7',
  number: 7,
  title: 'Growing up',
  color: '#e67e22',
  lessons: [
    {
      id: 'unit7-vocab1',
      type: 'vocabulary',
      title: 'Describing people',
      canDo: 'I can describe what people look like.',
      exercises: [
        {
          type: 'flashcard',
          cards: [
            { front: 'tall', back: 'having a great height' },
            { front: 'short', back: 'not having much height' },
            { front: 'slim', back: 'thin in an attractive way' },
            { front: 'curly hair', back: 'hair that forms curves or rings' },
            { front: 'straight hair', back: 'hair that is not curly or wavy' },
            { front: 'dark hair', back: 'hair that is black or dark brown' },
            { front: 'fair hair', back: 'hair that is light or blonde' },
            { front: 'beard', back: 'hair that grows on a man\'s chin' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'She has ___ hair — it goes up and down in circles.',
          options: ['straight', 'dark', 'curly', 'fair'],
          answer: 'curly',
        },
        {
          type: 'multiple-choice',
          question: 'He is very ___ — he is 2 metres tall.',
          options: ['short', 'slim', 'tall', 'dark'],
          answer: 'tall',
        },
        {
          type: 'matching',
          pairs: [
            { left: 'tall', right: 'great height' },
            { left: 'curly hair', right: 'hair in rings or waves' },
            { left: 'fair hair', right: 'light or blonde hair' },
            { left: 'beard', right: 'hair on a man\'s chin' },
            { left: 'slim', right: 'thin and attractive' },
          ],
        },
      ],
    },
    {
      id: 'unit7-grammar1',
      type: 'grammar',
      title: 'Object pronouns',
      canDo: 'I can use object pronouns correctly.',
      exercises: [
        {
          type: 'fill-blank',
          template: 'I see Tom every day. I like ___.',
          wordBank: ['he', 'him', 'his', 'they'],
          answer: 'him',
        },
        {
          type: 'fill-blank',
          template: 'Mary is my friend. I often call ___.',
          wordBank: ['she', 'her', 'hers', 'them'],
          answer: 'her',
        },
        {
          type: 'fill-blank',
          template: 'This is my book. Please give ___ to me.',
          wordBank: ['he', 'it', 'its', 'they'],
          answer: 'it',
        },
        {
          type: 'grammar-table',
          title: 'Object pronouns',
          rows: [
            { prompt: 'I', answer: 'me' },
            { prompt: 'you', answer: 'you' },
            { prompt: 'he', answer: 'him' },
            { prompt: 'she', answer: 'her' },
            { prompt: 'it', answer: 'it' },
            { prompt: 'we', answer: 'us' },
            { prompt: 'they', answer: 'them' },
          ],
        },
        {
          type: 'multiple-choice',
          question: 'Can you help ___? (me/I)',
          options: ['I', 'me', 'my', 'mine'],
          answer: 'me',
        },
      ],
    },
    {
      id: 'unit7-grammar2',
      type: 'grammar',
      title: 'Past simple questions',
      canDo: 'I can ask and answer questions in the past simple.',
      exercises: [
        {
          type: 'word-order',
          words: ['you', 'did', 'yesterday', 'what', 'do', '?'],
          answer: ['What', 'did', 'you', 'do', 'yesterday', '?'],
        },
        {
          type: 'word-order',
          words: ['school', 'go', 'she', 'to', 'did', '?'],
          answer: ['Did', 'she', 'go', 'to', 'school', '?'],
        },
        {
          type: 'multiple-choice',
          question: '___ they win the game?',
          options: ['Was', 'Were', 'Did', 'Do'],
          answer: 'Did',
        },
        {
          type: 'multiple-choice',
          question: 'What ___ you do last night?',
          options: ['do', 'did', 'does', 'done'],
          answer: 'did',
        },
        {
          type: 'fill-blank',
          template: '___ he play football yesterday?',
          wordBank: ['Do', 'Does', 'Did', 'Was'],
          answer: 'Did',
        },
        {
          type: 'true-false',
          statement: 'In past simple questions, we use "did" + base form of the verb.',
          answer: true,
        },
      ],
    },
  ],
};
