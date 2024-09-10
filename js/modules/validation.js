export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePassword(password) {
    return password.length >= 8;
}

export function validateAssetInput(asset) {
    return (
        asset.assetType &&
        asset.expirationDate &&
        asset.quantity > 0 &&
        asset.price > 0
    );
}