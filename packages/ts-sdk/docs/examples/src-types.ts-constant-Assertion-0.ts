// see AssertionT
const C: Validation<AssertionT> = Assertion.decode({
  item: {
    type: 'Article',
    id: '123456'
  },
  status: 'accepted',
  happened: '2020-01-01'
});
