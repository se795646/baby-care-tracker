export default function useLocalStorage() {
    function getItem(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch {
            return localStorage.getItem(key);
        }
    }

    function setItem(key, value) {
        localStorage.setItem(
            key,
            typeof value === 'string' ? value : JSON.stringify(value)
        );
    }

    function removeItem(key) {
        localStorage.removeItem(key);
    }

    return { getItem, setItem, removeItem };
}
