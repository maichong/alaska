/**
 * 解析Accept Language
 * @param {string} header
 * @returns {Array}
 */
export function parseAcceptLanguage(header: string): string[] {
  if (!header) {
    return [];
  }
  return header.split(',')
    .map((item) => {
      let lang = item.split(';q=');
      if (lang.length < 2) {
        return [item, 1];
      }
      return [lang[0], parseFloat(lang[1]) || 0];
    })
    .filter((lang) => lang[1] > 0)
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .map((lang: [string, number]) => lang[0]);
}
