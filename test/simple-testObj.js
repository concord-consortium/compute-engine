export const testObj = {
  fn: [
    'Delimiter',
    {
      fn: [
        'Divide',
        {
          num: '1',
          latex: '1',
          sourceOffsets: [12, 13],
        },
        {
          fn: ['Error', { str: 'missing' }, ['Latex', { str: '\\frac' }]],
          sourceOffsets: [15, 15],
        },
      ],
      latex: '\\frac{1}{}',
      sourceOffsets: [6, 16],
    },
  ],
  latex: '\\left(\\frac{1}{}\\right)',
  sourceOffsets: [0, 23],
};
