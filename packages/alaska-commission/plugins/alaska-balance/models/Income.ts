import Income from 'alaska-balance/models/Income';

export default function (IncomeModel: typeof Income) {
  let options: any[] = IncomeModel.fields.type.options || [];
  for (let option of options) {
    if (option.value === 'commission') return IncomeModel;
  }
  options.push({
    label: 'Commission',
    value: 'commission'
  });
  IncomeModel.fields.type.options = options;
  return IncomeModel;
}
