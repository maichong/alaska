// @flow

export function getOptionValue(opt: Alaska$SelectField$option|string): string {
  if (opt && typeof opt === 'object') return String(opt.value);
  return String(opt);
}
