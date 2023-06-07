// see StepT
const C: Validation<StepT> = Step.decode({
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
  id: 'step-2',
  'previous-step': 'step-1'
});
