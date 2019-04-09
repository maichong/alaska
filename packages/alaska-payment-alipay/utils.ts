
export function substr(str: string, length: number) {
  let result = '';
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 0 && code <= 128) {
      len += 1;
    } else {
      len += 2;
    }
    if (len + 3 > length) {
      return `${result}...`;
    }
    result += str[i];
  }
  return result;
}
