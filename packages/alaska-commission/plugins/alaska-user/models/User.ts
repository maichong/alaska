export default {
  fields: {
    promoter: {
      label: 'Promoter',
      type: 'relationship',
      ref: 'User',
      index: true
    }
  }
};
