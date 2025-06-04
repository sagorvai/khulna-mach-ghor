// Function to display custom messages instead of alert()
function showMessage(title, message) {
    const messageBoxOverlay = document.getElementById('message-box-overlay');
    const messageBoxTitle = document.getElementById('message-box-title');
    const messageBoxText = document.getElementById('message-box-text');
    const messageBoxOkBtn = document.getElementById('message-box-ok-btn');

    messageBoxTitle.textContent = title;
    messageBoxText.textContent = message;
    messageBoxOverlay.style.display = 'flex'; // Show the message box

    // Close the message box when OK button is clicked
    messageBoxOkBtn.onclick = () => {
        messageBoxOverlay.style.display = 'none';
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Get references to various HTML elements
    const productGridsContainer = document.querySelector('.products-section .container'); // Parent for all product grids
    const orderPopup = document.getElementById('order-popup');
    const popupProductName = document.getElementById('popup-product-name');
    const popupProductNameEn = document.getElementById('popup-product-name-en');
    const popupProductDescription = document.querySelector('.popup-product-description');
    const popupProductImage = document.getElementById('popup-product-image');
    const popupProductPrice = document.getElementById('popup-product-price');
    const popupQuantityInput = document.getElementById('popup-quantity');
    const popupProductUnit = document.getElementById('popup-product-unit');
    const addToCartFromPopupBtn = document.getElementById('add-to-cart-from-popup-btn');
    const closeOrderFormBtn = document.getElementById('close-order-form-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const totalBillSpan = document.getElementById('total-bill');
    const orderForm = document.getElementById('order-form');
    const orderSummarySection = document.querySelector('.order-summary-section');
    const invoiceDateSpan = document.getElementById('invoice-date');
    const invoiceOrderCodeSpan = document.getElementById('invoice-order-code');

    const orderSuccessPopup = document.getElementById('order-success-popup');
    const closeSuccessPopupBtn = document.getElementById('close-success-popup-btn'); // Top right X button
    const closeSuccessPopupBtnBottom = document.getElementById('close-success-popup-btn-bottom'); // Bottom OK button

    let cart = []; // Array to hold selected products in the cart
    let selectedProduct = null; // To hold the product currently selected from the product grid
    let allProducts = []; // To store all products fetched from the Google Sheet

    // --- Google Apps Script URL ---
    // This is the single URL for your newly deployed Apps Script Web App
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzk7ds_HA-wHiGumbysQ7h-4uXcj3QsXrgRRAIwkjhOqwVyWZCFwmdXi6umapfA2JS6/exec"; 

    /**
     * Fetches product data from Google Sheet via Apps Script and displays them.
     */
    async function loadProductsFromSheet() {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL); // Use the single URL for GET request
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const productsData = await response.json();
            
            if (productsData.error) {
                showMessage('পণ্য লোড করতে সমস্যা', 'Apps Script থেকে পণ্য ডেটা লোড করা যায়নি: ' + productsData.error);
                console.error('Apps Script Error:', productsData.error);
                return;
            }

            allProducts = productsData; // Store all fetched products
            renderProducts(allProducts); // Render them onto the page

        } catch (error) {
            console.error('Error loading products from sheet:', error);
            showMessage('পণ্য লোড করতে সমস্যা', 'পণ্য তালিকা লোড করা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
        }
    }

    /**
     * Renders products onto the HTML grids based on fetched data.
     * @param {Array} productsToRender - The array of product objects to render.
     */
    function renderProducts(productsToRender) {
        // Clear existing products from all grids
        document.getElementById('saltwater-fish-grid').innerHTML = '';
        document.getElementById('local-fish-grid').innerHTML = '';
        document.getElementById('rohu-fish-grid').innerHTML = '';
        document.getElementById('catla-fish-grid').innerHTML = '';
        document.getElementById('shrimp-fish-grid').innerHTML = '';
        document.getElementById('river-fish-grid').innerHTML = '';

        productsToRender.forEach(product => {
            // --- DEBUGGING: Log product details to console ---
            console.log('Processing Product:', product.Name_BN, 'Category:', product.Category, 'Available:', product.Available);

            // Ensure 'Available' is a string 'হ্যাঁ' or 'true' from Google Sheet
            // Added .toString().toLowerCase().trim() for robust checking
            const isAvailable = (product.Available && product.Available.toString().toLowerCase().trim() === 'হ্যাঁ' || 
                                 product.Available && product.Available.toString().toLowerCase().trim() === 'true'); 
            
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            if (!isAvailable) {
                productItem.classList.add('unavailable'); // Add class for unavailable items
            }

            // Set data attributes for the product
            productItem.dataset.name = product.Name_BN;
            productItem.dataset.nameEn = product.Name_EN || '';
            productItem.dataset.price = product.Price;
            productItem.dataset.unit = product.Unit || 'কেজি';
            productItem.dataset.description = product.Description || 'এই মাছ সম্পর্কে কোনো বিবরণ নেই।';
            productItem.dataset.imageUrl = product['Image URL'] || 'https://placehold.co/300x200/cccccc/333333?text=ছবি+নেই'; // Placeholder if no image

            productItem.innerHTML = `
                <img src="${productItem.dataset.imageUrl}" alt="${product.Name_BN} মাছ">
                <div class="product-bottom-section">
                    <div class="product-info-inline">
                        <h4>${product.Name_BN}</h4>
                        <p class="price">${product.Price} টাকা ${product.Unit}</p>
                    </div>
                    ${isAvailable ? 
                        `<button class="open-order-form-btn">পরিমাণ নির্ধারণ ও যুক্ত করুন</button>` : 
                        `<button class="open-order-form-btn unavailable-btn" disabled>স্টক নেই</button>`
                    }
                </div>
            `;

            // Append to the correct category grid based on 'Category' column in Google Sheet
            const targetGrid = getProductGridByCategory(product.Category);
            if (targetGrid) {
                targetGrid.appendChild(productItem);
            } else {
                // This warning will now also log the problematic category name
                console.warn('Uncategorized product (or missing grid for category):', product.Name_BN, 'Category received:', product.Category);
            }
        });
    }

    /**
     * Helper to get the correct product grid element based on category name.
     * Added .trim() and .toLowerCase() for robust matching.
     * @param {string} categoryName - The category name from the Google Sheet.
     * @returns {HTMLElement|null} The corresponding product grid element or null if not found.
     */
    function getProductGridByCategory(categoryName) {
        // Normalize the category name for robust matching
        const normalizedCategory = categoryName ? categoryName.toString().toLowerCase().trim() : '';

        switch (normalizedCategory) {
            case 'নোনা পানির মাছ':
                return document.getElementById('saltwater-fish-grid');
            case 'দেশি প্রজাতি':
            case 'খাল-বিলের মাছ':
                return document.getElementById('local-fish-grid');
            case 'রুই মাছ': // This will now match 'রুই মাছ', ' রুই মাছ ', 'রুই মাছ' (with different cases)
                return document.getElementById('rohu-fish-grid');
            case 'কাতল মাছ':
                return document.getElementById('catla-fish-grid');
            case 'চিংড়ি মাছ':
                return document.getElementById('shrimp-fish-grid');
            case 'নদীর মাছ':
                return document.getElementById('river-fish-grid');
            default:
                // This warning will now show the normalized category as well
                console.warn('Uncategorized product (or missing grid for category): Normalized Category:', normalizedCategory, 'Original Category:', categoryName);
                return null;
        }
    }


    /**
     * Updates the display of items in the cart and calculates the total bill.
     * Shows/hides the order summary section based on whether the cart is empty or not.
     */
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = ''; // Clear previous items from the cart display
        let total = 0;

        if (cart.length > 0) {
            orderSummarySection.style.display = 'block'; // Show order summary section if cart has items
            const now = new Date();
            // Format the current date in Bengali
            invoiceDateSpan.textContent = now.toLocaleDateString('bn-BD', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            invoiceOrderCodeSpan.textContent = generateOrderCode(); // Generate and display order code
        } else {
            orderSummarySection.style.display = 'none'; // Hide if cart is empty
        }

        // Iterate through each item in the cart and display it
        cart.forEach((item, index) => {
            const itemTotal = item.quantity * item.price; // Calculate total price for the current item
            total += itemTotal; // Add to overall total

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            // Populate item details including a remove button
            itemElement.innerHTML = `
                <span class="item-details">★ ${item.name} (${item.quantity} ${item.unit}) × ${item.price} টাকা =</span>
                <span class="item-total">${itemTotal} টাকা</span>
                <button class="remove-item-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            `;
            cartItemsContainer.appendChild(itemElement); // Add item to the cart display
        });

        totalBillSpan.textContent = total; // Update the total bill displayed
    }

    /**
     * Generates a unique order code based on the current date and a random string.
     * @returns {string} The generated order code.
     */
    function generateOrderCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (00-padded)
        const day = now.getDate().toString().padStart(2, '0'); // Day (00-padded)
        const uniqueId = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 random uppercase characters
        return `KMG-${year}${month}${day}-${uniqueId}`; // Example: KMG-20250530-ABCD
    }

    // Event listener for opening the order popup when a product item is clicked (using event delegation)
    // Attach listener to a common parent like products-section or document.body
    document.querySelector('.products-section').addEventListener('click', (e) => {
        const productItem = e.target.closest('.product-item');
        const openOrderBtn = e.target.closest('.open-order-form-btn');

        if (productItem && openOrderBtn && !openOrderBtn.disabled) { // Check if a product item and an enabled button were clicked
            // Extract product data from data attributes
            const name = productItem.dataset.name;
            const nameEn = productItem.dataset.nameEn || '';
            const price = parseFloat(productItem.dataset.price);
            const unit = productItem.dataset.unit; // Use unit from data-attribute
            const description = productItem.dataset.description || 'এই মাছ সম্পর্কে কোনো বিবরণ নেই।';
            const imageUrl = productItem.querySelector('img').src; // Get image URL from the <img> tag within the product item

            // Populate the popup with selected product details
            popupProductName.textContent = name;
            popupProductNameEn.textContent = nameEn;
            popupProductDescription.textContent = description;
            popupProductImage.src = imageUrl;
            popupProductPrice.textContent = `${price} টাকা${unit === 'কেজি' ? '/কেজি' : ''}`;
            popupQuantityInput.value = '1'; // Default quantity to 1 for KG
            popupQuantityInput.min = '0.5'; // Minimum quantity to 0.5 for KG
            popupQuantityInput.step = '0.5'; // Step increment to 0.5 for KG
            popupProductUnit.textContent = unit;
            selectedProduct = { name, nameEn, price, unit, description, imageUrl }; // Store the selected product object
            orderPopup.style.display = 'flex'; // Show the popup
        } else if (openOrderBtn && openOrderBtn.disabled) {
            showMessage('স্টক নেই', 'এই পণ্যটি বর্তমানে স্টক নেই।');
        }
    });

    // Event listener for adding an item to the cart from the popup
    addToCartFromPopupBtn.addEventListener('click', () => {
        if (selectedProduct) {
            const quantity = parseFloat(popupQuantityInput.value);
            // Validate quantity input
            if (isNaN(quantity) || quantity <= 0) {
                showMessage('ভুল পরিমাণ', 'দয়া করে সঠিক পরিমাণ দিন।'); // Use custom message box
                return;
            }

            // Check if the product already exists in the cart
            const existingItemIndex = cart.findIndex(item => item.name === selectedProduct.name);

            if (existingItemIndex > -1) {
                // If exists, update its quantity
                cart[existingItemIndex].quantity += quantity;
            } else {
                // If not, add as a new item
                cart.push({ ...selectedProduct, quantity }); // Add quantity to selected product object
            }
            updateCartDisplay(); // Refresh cart display
            orderPopup.style.display = 'none'; // Hide the popup
            selectedProduct = null; // Clear selected product
        }
    });

    // Event listener for closing the order popup
    closeOrderFormBtn.addEventListener('click', () => {
        orderPopup.style.display = 'none';
        selectedProduct = null; // Clear selected product
    });

    // Event listener for removing an item from the cart
    cartItemsContainer.addEventListener('click', (e) => {
        // Check if the clicked element or its closest parent is a remove button
        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            const button = e.target.closest('.remove-item-btn');
            const indexToRemove = parseInt(button.dataset.index); // Get the index of the item to remove
            cart.splice(indexToRemove, 1); // Remove the item from the cart array
            updateCartDisplay(); // Refresh cart display
        }
    });

    // Event listener for handling order submission
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        if (cart.length === 0) {
            showMessage('অর্ডার ত্রুটি', 'অর্ডার করার জন্য কোনো পণ্য নির্বাচন করা হয়নি।'); // Use custom message box
            return;
        }

        // Get customer details from the form
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerAddress = document.getElementById('customer-address').value;

        // Validate customer details
        if (!customerName || !customerPhone || !customerAddress) {
            showMessage('তথ্য পূরণ করুন', 'দয়া করে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করুন।'); // Changed: Using showMessage for validation
            return;
        }

        // Prepare order data object
        const orderData = {
            customerName: customerName,
            customerPhone: customerPhone,
            customerAddress: customerAddress,
            items: cart.map(item => ({ // Map cart items to a simplified structure for submission
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                totalItemPrice: item.quantity * item.price
            })),
            totalBill: parseFloat(totalBillSpan.textContent),
            orderDate: invoiceDateSpan.textContent,
            orderCode: invoiceOrderCodeSpan.textContent
        };

        // --- IMPORTANT: This is the part that sends order data to Google Apps Script ---
        try {
            // Send data to Google Apps Script
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { // Use the single URL for POST request
                method: 'POST',
                mode: 'no-cors', // Required for simple Apps Script POST (no direct response)
                headers: {
                    'Content-Type': 'application/json', // Indicate that you are sending JSON
                },
                body: JSON.stringify(orderData), // Convert your data object to a JSON string
            });

            // In 'no-cors' mode, you typically don't get a usable response object directly from fetch,
            // but the request is sent. The success message below assumes the Apps Script processed it.
            console.log('Order data sent to Google Sheet (check your sheet)!');

            // Show success popup and clear form/cart ONLY if the fetch request was initiated successfully
            orderSuccessPopup.style.display = 'flex'; // Show success popup

            // Clear form and cart after successful order
            orderForm.reset(); // Reset the customer information form
            cart = []; // Empty the cart
            updateCartDisplay(); // Update display, which will hide the order summary section

        } catch (error) {
            // If there's a network error or problem initiating the fetch request
            console.error('Error sending order:', error);
            showMessage('অর্ডার জমা দিতে সমস্যা', 'অর্ডার জমা দিতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।');
            // Do NOT clear cart or show success if there was an error
        }
        // --- End of IMPORTANT section ---
    });

    // Event listener for closing the order success popup (top right X button)
    closeSuccessPopupBtn.addEventListener('click', () => {
        orderSuccessPopup.style.display = 'none';
    });
    
    // Event listener for closing the order success popup (bottom OK button)
    closeSuccessPopupBtnBottom.addEventListener('click', () => {
        orderSuccessPopup.style.display = 'none';
    });

    // Initial call to update cart display in case there's any pre-loaded data (though not in this example)
    updateCartDisplay();

    // Load products when the page loads
    loadProductsFromSheet(); // Call this function to fetch and display products
});
