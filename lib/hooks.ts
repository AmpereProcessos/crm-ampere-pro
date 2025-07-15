import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export function useKey(key: string, cb: () => void) {
	const callbackRef = useRef(cb);
	useEffect(() => {
		callbackRef.current = cb;
	}, [cb]);
	useEffect(() => {
		function handle(event: any) {
			if (event.code === key) {
				// @ts-ignore
				callbackRef.current(event);
			}
		}
		document.addEventListener("keydown", handle);
		return () => document.removeEventListener("keypress", handle);
	}, [key]);
}
export function useClickOutside(ref: React.MutableRefObject<any>, cb: () => void) {
	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (ref.current && !ref.current.contains(event.target)) {
				cb();
			}
		};
		document.addEventListener("click", (e) => handleClickOutside(e), true);
		return () => {
			document.removeEventListener("click", (e) => handleClickOutside(e), true);
		};
	}, [cb]);
}

export async function copyToClipboard(text: string | undefined) {
	if (!text) return toast.error("Conteúdo não disponível para cópia.");
	await navigator.clipboard.writeText(text);
	return toast.success("Copiado para área de transferência.");
}

// Optional: Memoized version for objects
export function useDebounceMemo<T extends object>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	const timeoutRef = useRef<NodeJS.Timeout>();
	const previousValueRef = useRef<T>(value);

	useEffect(() => {
		// Compare objects deeply
		const hasChanged = JSON.stringify(previousValueRef.current) !== JSON.stringify(value);

		if (hasChanged) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				setDebouncedValue(value);
				previousValueRef.current = value;
			}, delay);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [value, delay]);

	return debouncedValue;
}
