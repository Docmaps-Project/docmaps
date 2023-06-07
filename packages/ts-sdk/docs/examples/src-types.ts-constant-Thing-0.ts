// see ThingT
const C: Validation<ThingT> = Thing.decode({
  published: '2020-01-01',
  id: '123456',
  doi: '10.12345/abcdef',
  type: 'Article',
  content: [{
    type: 'text',
    text: 'This is an example of a thing'
  }]
});
