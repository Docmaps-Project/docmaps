// see DocmapT
const C: Validation<DocmapT> = Docmap.decode({
  context: [{
    type: 'schema',
    value: 'https://schema.org/'
  }],
  id: '123456',
  type: 'Docmap',
  publisher: {
    type: 'person',
    name: 'John Doe'
  },
  created: '2020-01-01',
  steps: {
    'step-1': {
      actions: [{
        outputs: [{
          published: '2020-01-01',
          id: '123456',
          doi: '10.12345/abcdef',
          type: 'Article',
          content: [{
            type: 'text',
            text: 'This is an example of a thing'
          }]
        }],
        participants: [{
          actor: {
            type: 'person',
            name: 'John Doe'
          },
          role: 'author'
        }],
        id: '123456'
      }],
      inputs: [{
        published: '2020-01-01',
        id: '123456',
        doi: '10.12345/abcdef',
        type: 'Article',
        content: [{
          type: 'text',
          text: 'This is an example of a thing'
        }]
      }],
      assertions: [{
        item: {
          type: 'Article',
          id: '123456'
        },
        status: 'accepted',
        happened: '2020-01-01'
      }],
      id: '123456',
      'next-step': 'step-2',
    },
    'step-2': {
      //...
    }
  },
  'first-step': 'step-1',
  updated: '2020-01-01'
});
