
export const fields = {
  orders: {
    label: 'Orders',
    type: 'relationship',
    ref: 'alaska-order.Order',
    multi: true,
    protected: true,
    disabled: true
  }
};
