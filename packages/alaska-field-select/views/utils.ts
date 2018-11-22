import { SelectOption, SelectValue } from '@samoyed/types';

export function getOptionValue(opt: SelectOption | SelectValue): string {
  if (Array.isArray(opt)) {
    return ''; //ERROR
  }
  if (opt && typeof opt === 'object') {
    return String(opt.value);
  }
  return String(opt);
}
