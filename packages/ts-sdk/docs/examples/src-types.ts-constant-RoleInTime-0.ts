// see RoleInTimeT
const C: Validation<RoleInTimeT> = RoleInTime.decode({
  actor: {
    type: 'person',
    name: 'John Doe'
  },
  role: 'author'
});
