export function setStorage(key: string, value: any): void {
  if (!window.localStorage) return;
  value = JSON.stringify(value);
  window.localStorage.setItem(key, value);
}

export function getStorage(key: string): null | any {
  if (!window.localStorage) return null;
  let value = window.localStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
    }
  }
  return null;
}

export function removeStorage(key: string): void {
  if (!window.localStorage) return;
  window.localStorage.removeItem(key);
}
