function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Cart management class
class CartManager {
    constructor() {
        this.cartContainer = document.getElementById('cart-container');
        this.cartTotals = document.getElementById('cart-totals');
        this.cartItems = [];
    }

    // Fetch cart data from API
    async fetchCartData() {
        try {
            const response = await fetch('https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889');
            const data = await response.json();

            // Assign initial price of 2500 for all items
            this.cartItems = data.items.map(item => ({
                ...item,
                presentment_price: 250000, // 2500 in cents
                line_price: 250000 // Initial subtotal for one quantity
            }));

            this.renderCartItems();
        } catch (error) {
            console.error('Error fetching cart data:', error);
            this.cartContainer.innerHTML = '<p>Error loading cart items. Please try again later.</p>';
        }
    }

    // Render cart items
    renderCartItems() {
        // Clear existing content
        this.cartContainer.innerHTML = '';

        // Render each cart item
        this.cartItems.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="item-details">
                    <h3>${item.title}</h3>
                    <p>Price: ${formatCurrency(item.presentment_price / 100)}</p>
                    <div class="quantity-container">
                        <label for="quantity-${item.id}">Quantity:</label>
                        <input 
                            type="number" 
                            id="quantity-${item.id}" 
                            value="${item.quantity}" 
                            min="1"
                            data-index="${index}"
                            onchange="cartManager.updateQuantity(event)"
                        >
                        <span 
                            class="remove-item" 
                            data-index="${index}"
                            onclick="cartManager.removeItem(event)"
                        >
                            🗑️
                        </span>
                    </div>
                    <p class="subtotal">Subtotal: ${formatCurrency((item.line_price / 100))}</p>
                </div>
            `;
            this.cartContainer.appendChild(cartItemElement);
        });

        this.updateCartTotals();
    }

    // Update item quantity
    updateQuantity(event) {
        const index = event.target.getAttribute('data-index');
        const newQuantity = parseInt(event.target.value);

        if (newQuantity > 0) {
            this.cartItems[index].quantity = newQuantity;
            this.cartItems[index].line_price = newQuantity * this.cartItems[index].presentment_price;
            this.renderCartItems();
        }
    }

    // Remove item from cart
    removeItem(event) {
        const index = event.target.getAttribute('data-index');
        this.cartItems.splice(index, 1);
        this.renderCartItems();
    }

    // Calculate and update cart totals
    updateCartTotals() {
        if (this.cartItems.length === 0) {
            this.cartTotals.innerHTML = '<p>Your cart is empty</p>';
            return;
        }

        const subtotal = this.cartItems.reduce((total, item) => total + (item.line_price / 100), 0);
        const total = subtotal;

        this.cartTotals.innerHTML = `
            <p>Subtotal: ${formatCurrency(subtotal)}</p>
            <p>Total: ${formatCurrency(total)}</p>
            <button class="checkout-btn" onclick="cartManager.checkout()">Check Out</button>
        `;
    }

    // Checkout function (placeholder)
    checkout() {
        alert('Checkout functionality will be implemented in a real-world scenario.');
    }
}

// Initialize cart manager
const cartManager = new CartManager();
cartManager.fetchCartData();
