// @flow

export function getOptionValue(opt: Alaska$SelectField$option | Alaska$SelectField$value): string {
  if (Array.isArray(opt)) {
    return ''; //ERROR
  }
  if (opt && typeof opt === 'object') {
    return String(opt.value);
  }
  return String(opt);
}
