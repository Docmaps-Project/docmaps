// see ActionT
const C: Validation<ActionT> = Action.decode({
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
});
