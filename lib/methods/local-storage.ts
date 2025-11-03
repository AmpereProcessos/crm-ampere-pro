export function setLocalStorage(key: string, value: string): void {
	localStorage.setItem(key, value);
}

export function getLocalStorage(key: string): string | null {
	return localStorage.getItem(key);
}

export function removeLocalStorage(key: string): void {
	localStorage.removeItem(key);
}
