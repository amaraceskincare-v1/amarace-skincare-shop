export const flyToCart = (startElement, cartIconSelector = '.cart-icon') => {
    if (!startElement) return;

    const cartIcon = document.querySelector(cartIconSelector);
    if (!cartIcon) return;

    const startRect = startElement.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    // Create a fly element (using a small circle instead of full image for simplicity/performance, or can use image)
    const flyElement = document.createElement('div');
    flyElement.className = 'fly-to-cart-item';

    // Style it
    Object.assign(flyElement.style, {
        position: 'fixed',
        top: `${startRect.top + startRect.height / 2}px`,
        left: `${startRect.left + startRect.width / 2}px`,
        width: '20px',
        height: '20px',
        backgroundColor: 'var(--primary)',
        borderRadius: '50%',
        zIndex: '9999',
        pointerEvents: 'none',
        transition: 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)',
        opacity: '1'
    });

    document.body.appendChild(flyElement);

    // Animate
    requestAnimationFrame(() => {
        flyElement.style.top = `${endRect.top + endRect.height / 2}px`;
        flyElement.style.left = `${endRect.left + endRect.width / 2}px`;
        flyElement.style.transform = 'scale(0.1)';
        flyElement.style.opacity = '0';
    });

    // Clean up
    setTimeout(() => {
        flyElement.remove();
        // Trigger a shake on the cart icon
        cartIcon.classList.add('cart-shake');
        setTimeout(() => cartIcon.classList.remove('cart-shake'), 500);
    }, 800);
};
