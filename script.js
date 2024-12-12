// Configuration
const API_URL = 'https://cdn.shopify.com/s/files/1/0883/2188/4479/files/cart.json?v=1'; // Replace with actual API endpoint

// Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount / 100);
}

function saveCartToLocalStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function getCartFromLocalStorage() {
    return JSON.parse(localStorage.getItem('cart')) || null;
}

// Cart Management
class CartManager {
    constructor() {
        this.items = [];
        this.subtotal = 0;
        this.cartItemsContainer = document.getElementById('cart-items');
        this.subtotalElement = document.getElementById('cart-subtotal');
        this.totalElement = document.getElementById('cart-total');
        this.cartCountElement = document.querySelector('.cart-count');
        this.removeModal = document.getElementById('remove-item-modal');
        this.itemToRemove = null;
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('checkout-btn').addEventListener('click', this.proceedToCheckout.bind(this));
        document.getElementById('cancel-remove').addEventListener('click', this.closeRemoveModal.bind(this));
        document.getElementById('confirm-remove').addEventListener('click', this.confirmRemoveItem.bind(this));
    }

    async fetchCartItems() {
        try {
            const storedCart = getCartFromLocalStorage();
            if (storedCart) {
                this.items = storedCart.items;
                this.renderCartItems();
                return;
            }

            const response = await fetch(API_URL);
            const cartData = await response.json();
            this.items = cartData.items;
            this.renderCartItems();
            saveCartToLocalStorage(cartData);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            this.cartItemsContainer.innerHTML = '<p>Error loading cart. Please try again later.</p>';
        }
    }

    renderCartItems() {
        this.cartItemsContainer.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');
        this.calculateTotals();
        this.attachQuantityEventListeners();
        this.attachRemoveEventListeners();
    }

    createCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h3>${item.title}</h3>
                    <p>${formatCurrency(item.price)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                        <button class="quantity-btn increase">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p>${formatCurrency(item.price * item.quantity)}</p>
                    <i class="fas fa-trash remove-item"></i>
                </div>
            </div>
        `;
    }

    attachQuantityEventListeners() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
        const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');

        quantityInputs.forEach(input => {
            input.addEventListener('change', (e) => this.updateItemQuantity(e.target));
        });

        increaseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                input.value = parseInt(input.value) + 1;
                this.updateItemQuantity(input);
            });
        });

        decreaseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.nextElementSibling;
                if (input.value > 1) {
                    input.value = parseInt(input.value) - 1;
                    this.updateItemQuantity(input);
                }
            });
        });
    }

    updateItemQuantity(input) {
        const cartItem = input.closest('.cart-item');
        const itemId = cartItem.dataset.id;
        const newQuantity = parseInt(input.value);

        const itemToUpdate = this.items.find(item => item.id === parseInt(itemId));
        
        if (itemToUpdate) {
            // Update quantity
            itemToUpdate.quantity = newQuantity;
            
            // Update item total in the UI
            const itemTotalElement = cartItem.querySelector('.cart-item-total p');
            itemTotalElement.textContent = formatCurrency(itemToUpdate.price * newQuantity);
            
            // Recalculate totals
            this.calculateTotals();
            
            // Update local storage
            saveCartToLocalStorage({ items: this.items });
        }
    }

    calculateTotals() {
        // Calculate subtotal
        this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Update subtotal and total in UI
        this.subtotalElement.textContent = formatCurrency(this.subtotal);
        this.totalElement.textContent = formatCurrency(this.subtotal);
        
        // Update cart count
        const totalItems = this.items.reduce((count, item) => count + item.quantity, 0);
        this.cartCountElement.textContent = totalItems;
    }

    attachRemoveEventListeners() {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                this.itemToRemove = cartItem;
                this.showRemoveModal();
            });
        });
    }

    showRemoveModal() {
        this.removeModal.style.display = 'block';
    }

    closeRemoveModal() {
        this.removeModal.style.display = 'none';
        this.itemToRemove = null;
    }

    confirmRemoveItem() {
        if (this.itemToRemove) {
            const itemId = this.itemToRemove.dataset.id;
            
            // Remove item from items array
            this.items = this.items.filter(item => item.id !== parseInt(itemId));
            
            // Remove item from DOM
            this.itemToRemove.remove();
            
            // Recalculate totals
            this.calculateTotals();
            
            // Update local storage
            saveCartToLocalStorage({ items: this.items });
            
            // Close modal
            this.closeRemoveModal();
        }
    }

    proceedToCheckout() {
        // Basic checkout implementation
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // You could redirect to a checkout page or open a checkout modal
        alert('Proceeding to checkout...');
        // Example: window.location.href = '/checkout';
    }

    // Initialize cart when script loads
    init() {
        this.fetchCartItems();
    }
}

// Create and initialize cart manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    const cartManager = new CartManager();
    cartManager.init();
});