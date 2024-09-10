const cache = new Map();

export function setCache(key, value, expirationInMinutes = 5) {
    const expirationTime = Date.now() + expirationInMinutes * 60 * 1000;
    cache.set(key, { value, expirationTime });
}

export function getCache(key) {
    const cachedItem = cache.get(key);
    if (cachedItem && cachedItem.expirationTime > Date.now()) {
        return cachedItem.value;
    }
    cache.delete(key);
    return null;
}
