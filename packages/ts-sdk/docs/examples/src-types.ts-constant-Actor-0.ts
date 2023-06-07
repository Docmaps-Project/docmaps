// see ActorT
const B: Validation<ActorT> = Actor.decode({
  type: 'person',
  name: 'John Doe'
});
