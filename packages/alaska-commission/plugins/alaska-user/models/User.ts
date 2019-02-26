export default {
  fields: {
    promoter: {
      label: 'Promoter',
      type: 'relationship',
      ref: 'User',
      index: true,
      disabled: [{
        ability: 'alaska-user.User.update'
      }]
    }
  }
};
