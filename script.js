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
    // --- Configuration ---
    // Make sure this URL is your deployed Google Apps Script Web App URL
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwujqTeRdbVR6mqLDKngq_RViI7Fwha5dH1VvD_CfmkZvWma32JSLEB1vgIs9J1gfn8pQ/exec';

    // --- HTML Element References ---
    const productsSectionContainer = document.querySelector('.products-section .container');
    const productGridPlaceholder = document.querySelector('.product-grid-placeholder');
    const productQuantityPopup = document.getElementById('product-quantity-popup');
    const popupProductName = document.getElementById('popup-product-name');
    const popupProductNameEn = document.getElementById('popup-product-name-en');
    const popupProductDescription = document.querySelector('.popup-product-description');
    const popupProductImage = document.getElementById('popup-product-image');
    const popupProductPrice = document.getElementById('popup-product-price');
    const popupQuantityInput = document.getElementById('popup-quantity');
    const popupProductUnit = document.getElementById('popup-product-unit');
    const closeProductQuantityPopupBtn = document.getElementById('close-product-quantity-popup-btn');
    const addProductToCartFromPopupBtn = document.getElementById('add-to-cart-from-popup-btn');
    const orderSummaryModal = document.getElementById('order-summary-modal');
    const closeOrderSummaryBtn = document.getElementById('close-order-summary-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const totalBillSpan = document.getElementById('total-bill');
    const orderForm = document.getElementById('order-form');
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    const customerAddressInput = document.getElementById('customer-address');
    const orderSuccessPopup = document.getElementById('order-success-popup');
    const invoiceOrderCodeSpan = document.getElementById('invoice-order-code');
    const invoiceDateSpan = document.getElementById('invoice-date');
    const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const floatingCartButton = document.getElementById('floating-cart-button');
    const cartItemCountSpan = document.getElementById('cart-item-count');
    const quantityUnitSpan = document.getElementById('quantity-unit');


    let products = []; // To store products fetched from the Google Sheet
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Load cart from localStorage
    let selectedProduct = null; // Product currently selected in the quantity popup

    // --- Utility Functions ---

    // Function to generate a unique order code
    function generateOrderCode() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 random digits
        return `KMG-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
    }

    // Function to format date for display
    function getFormattedDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        return new Date(date).toLocaleString('bn-BD', options);
    }

    // --- Product Display ---

    // Function to load products from Google Sheet
    async function loadProductsFromSheet() {
        try {
            productGridPlaceholder.innerHTML = '<p style="text-align: center; color: #555; font-size: 1.1rem; padding: 50px;">পণ্য লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।</p>';
            
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
            
            if (!response.ok) {
                const errorText = await response.text(); // Get raw error response
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            products = await response.json();
            
            if (products.error) { // Check if the Apps Script returned an error object
                throw new Error(products.error);
            }

            if (!Array.isArray(products) || products.length === 0) {
                productGridPlaceholder.innerHTML = '<p style="text-align: center; color: #555; font-size: 1.1rem; padding: 50px;">কোনো মাছ পাওয়া যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>';
                floatingCartButton.style.display = 'none'; // Hide cart if no products
                return;
            }

            // Clear placeholder and display products
            productGridPlaceholder.innerHTML = '';
            displayProducts(products);
            floatingCartButton.style.display = 'flex'; // Show cart once products are loaded

        } catch (error) {
            console.error('Error loading products:', error);
            productGridPlaceholder.innerHTML = `<p style="text-align: center; color: #FF0000; font-size: 1.1rem; padding: 50px;">মাছ লোড করা যায়নি: ${error.message}<br> অনুগ্রহ করে পরে আবার চেষ্টা করুন বা অ্যাডমিনকে জানান।</p>`;
            floatingCartButton.style.display = 'none'; // Hide cart on error
        }
    }


    // Function to display products on the page
    function displayProducts(productsToDisplay) {
        productGridPlaceholder.innerHTML = ''; // Clear previous content
        const productGrid = document.createElement('div');
        productGrid.className = 'product-grid';

        productsToDisplay.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.innerHTML = `
                <img src="${product.ছবি || 'https://placehold.co/200x150?text=ছবি+নেই'}" alt="${product.নাম_বাংলা}">
                <h4 class="product-name-bn">${product.নাম_বাংলা}</h4>
                <p class="product-name-en">${product.Name_English}</p>
                <p class="product-price">মূল্য: ${product.মূল্য} টাকা প্রতি ${product.ইউনিট}</p>
                <button class="btn add-to-cart-btn" data-product-id="${product.ID}">অর্ডার করুন</button>
            `;
            productGrid.appendChild(productItem);
        });
        productGridPlaceholder.appendChild(productGrid); // Append the grid to the placeholder

        // Add event listeners to "অর্ডার করুন" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                selectedProduct = products.find(p => p.ID == productId); // Use == for loose comparison as ID might be number/string
                if (selectedProduct) {
                    showProductQuantityPopup(selectedProduct);
                } else {
                    showMessage('ত্রুটি', 'পণ্য খুঁজে পাওয়া যায়নি।');
                }
            });
        });
    }

    // --- Cart and Order Logic ---

    // Show quantity selection popup
    function showProductQuantityPopup(product) {
        popupProductName.textContent = product.নাম_বাংলা;
        popupProductNameEn.textContent = product.Name_English;
        popupProductDescription.textContent = product.বিবরণ || '';
        popupProductImage.src = product.ছবি || 'https://placehold.co/100x100?text=ছবি';
        popupProductPrice.textContent = product.মূল্য;
        popupProductUnit.textContent = product.ইউনিট;
        quantityUnitSpan.textContent = product.ইউনিট;

        // Reset quantity input to 1 or last added quantity if product is already in cart
        const existingCartItem = cart.find(item => item.id === product.ID);
        popupQuantityInput.value = existingCartItem ? existingCartItem.quantity : 1;

        productQuantityPopup.style.display = 'flex';
    }

    // Close quantity selection popup
    closeProductQuantityPopupBtn.addEventListener('click', () => {
        productQuantityPopup.style.display = 'none';
        selectedProduct = null;
    });

    // Add product to cart from popup
    addProductToCartFromPopupBtn.addEventListener('click', () => {
        if (!selectedProduct) return;

        const quantity = parseFloat(popupQuantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            showMessage('পরিমাণের ত্রুটি', 'দয়া করে একটি বৈধ পরিমাণ লিখুন।');
            return;
        }

        const itemTotal = quantity * selectedProduct.মূল্য;

        const existingItemIndex = cart.findIndex(item => item.id === selectedProduct.ID);

        if (existingItemIndex > -1) {
            // Update existing item
            cart[existingItemIndex].quantity = quantity;
            cart[existingItemIndex].totalItemPrice = itemTotal;
        } else {
            // Add new item
            cart.push({
                id: selectedProduct.ID,
                name: selectedProduct.নাম_বাংলা,
                nameEn: selectedProduct.Name_English,
                price: selectedProduct.মূল্য,
                unit: selectedProduct.ইউনিট,
                quantity: quantity,
                totalItemPrice: itemTotal
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to localStorage
        updateCartDisplay();
        productQuantityPopup.style.display = 'none';
        showMessage('সফল!', `${selectedProduct.নাম_বাংলা} ${quantity} ${selectedProduct.ইউনিট} আপনার কার্টে যোগ করা হয়েছে।`);
    });

    // Update cart item count and total bill
    function updateCartDisplay() {
        const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItemsInCart.toFixed(1); // Display with one decimal place

        // Show/hide floating cart button based on cart items
        if (totalItemsInCart > 0 && products.length > 0) { // Also check if products are loaded
            floatingCartButton.style.display = 'flex';
        } else {
            floatingCartButton.style.display = 'none';
        }
    }

    // Show order summary modal
    floatingCartButton.addEventListener('click', () => {
        if (cart.length === 0) {
            showMessage('কার্ট খালি', 'আপনার কার্টে কোনো পণ্য নেই। কিছু মাছ যোগ করুন!');
            return;
        }
        renderCartSummary();
        orderSummaryModal.style.display = 'flex';
    });

    // Close order summary modal
    closeOrderSummaryBtn.addEventListener('click', () => {
        orderSummaryModal.style.display = 'none';
    });

    // Render cart items in the order summary modal
    function renderCartSummary() {
        cartItemsContainer.innerHTML = ''; // Clear previous items
        let totalBill = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">আপনার কার্টে কোনো পণ্য নেই।</p>';
            totalBillSpan.textContent = '0';
            return;
        }

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-summary-item';
            itemDiv.innerHTML = `
                <span>${item.name} (${item.quantity} ${item.unit})</span>
                <span>${item.totalItemPrice} টাকা</span>
                <button class="remove-item-btn" data-item-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
            `;
            cartItemsContainer.appendChild(itemDiv);
            totalBill += item.totalItemPrice;
        });

        totalBillSpan.textContent = totalBill.toFixed(2); // Display total bill with 2 decimal places

        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemIdToRemove = event.target.dataset.itemId;
                cart = cart.filter(item => item.id != itemIdToRemove); // Filter out the item
                localStorage.setItem('cart', JSON.stringify(cart)); // Update localStorage
                updateCartDisplay(); // Update cart count
                renderCartSummary(); // Re-render summary
                if (cart.length === 0) {
                    orderSummaryModal.style.display = 'none'; // Close modal if cart becomes empty
                }
            });
        });
    }

    // Handle order submission
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        if (cart.length === 0) {
            showMessage('কার্ট খালি', 'অর্ডার করার জন্য আপনার কার্টে কোনো পণ্য নেই।');
            return;
        }

        const orderCode = generateOrderCode();
        const orderDate = new Date().toISOString(); // ISO string for consistent date handling
        const customerName = customerNameInput.value;
        const customerPhone = customerPhoneInput.value;
        const customerAddress = customerAddressInput.value;
        const totalBill = parseFloat(totalBillSpan.textContent);

        const orderData = {
            orderCode,
            orderDate,
            customerName,
            customerPhone,
            customerAddress,
            totalBill,
            items: cart.map(item => ({
                name: item.name,
                nameEn: item.nameEn,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                totalItemPrice: item.totalItemPrice
            }))
        };

        // Disable form elements and show loading indicator
        orderForm.querySelector('button[type="submit"]').disabled = true;
        orderForm.querySelector('button[type="submit"]').textContent = 'অর্ডার পাঠানো হচ্ছে...';
        orderForm.style.opacity = 0.7;
        orderForm.style.pointerEvents = 'none';


        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors', // Ensure CORS is enabled
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                // Show success popup
                invoiceOrderCodeSpan.textContent = orderCode;
                invoiceDateSpan.textContent = getFormattedDate(orderDate);
                orderSummaryModal.style.display = 'none';
                orderSuccessPopup.style.display = 'flex';

                // Setup WhatsApp share button
                whatsappShareBtn.onclick = () => shareOnWhatsApp(orderData);

                // Setup PDF download button
                downloadPdfBtn.onclick = () => generatePdfInvoice(orderData);

                // Clear cart after successful order
                cart = [];
                localStorage.removeItem('cart');
                updateCartDisplay();

                // Clear form fields
                orderForm.reset();

            } else {
                showMessage('অর্ডার ব্যর্থ', `অর্ডার জমা দিতে সমস্যা হয়েছে: ${result.error || 'অজানা ত্রুটি'}`);
                console.error('Order submission failed:', result.error);
            }
        } catch (error) {
            showMessage('যোগাযোগের ত্রুটি', `অর্ডার জমা দেওয়া যায়নি: ${error.message}। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন বা পরে আবার চেষ্টা করুন।`);
            console.error('Fetch error:', error);
        } finally {
            // Re-enable form elements
            orderForm.querySelector('button[type="submit"]').disabled = false;
            orderForm.querySelector('button[type="submit"]').textContent = 'অর্ডার নিশ্চিত করুন';
            orderForm.style.opacity = 1;
            orderForm.style.pointerEvents = 'auto';
        }
    });


    // Close success popup
    document.getElementById('close-success-popup-btn').addEventListener('click', () => {
        orderSuccessPopup.style.display = 'none';
    });


    // --- WhatsApp Share ---
    function shareOnWhatsApp(order) {
        let message = `*খুলনা মাছ ঘর থেকে আপনার অর্ডার!*\n\n`;
        message += `অর্ডার কোড: *${order.orderCode}*\n`;
        message += `তারিখ: ${getFormattedDate(order.orderDate)}\n\n`;
        message += `*গ্রাহকের বিবরণ:*\n`;
        message += `নাম: ${order.customerName}\n`;
        message += `ফোন: ${order.customerPhone}\n`;
        message += `ঠিকানা: ${order.customerAddress}\n\n`;
        message += `*অর্ডারকৃত পণ্য:*\n`;
        order.items.forEach(item => {
            message += `- ${item.name} (${item.quantity} ${item.unit}) - ${item.totalItemPrice} টাকা\n`;
        });
        message += `\n*মোট বিল: ${order.totalBill} টাকা*\n\n`;
        message += `খুব শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবে।\nখুলনা মাছ ঘরের সাথে থাকার জন্য ধন্যবাদ!`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }


    // --- PDF Generation ---
    async function generatePdfInvoice(order) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Ensure Noto Sans Bengali font is loaded for jsPDF
        // You might need to embed the font if it's not available by default
        // For simplicity, we'll try with default or a common font.
        // For production, consider using jsPDF font embedding for Bengali characters.
        // Example: doc.addFont("NotoSansBengali-Regular.ttf", "NotoSansBengali", "normal");
        // doc.setFont("NotoSansBengali");

        doc.setFontSize(22);
        doc.text("খুলনা মাছ ঘর - রসিদ", 105, 20, null, null, "center");

        doc.setFontSize(12);
        doc.text(`অর্ডার কোড: ${order.orderCode}`, 20, 35);
        doc.text(`তারিখ: ${getFormattedDate(order.orderDate)}`, 20, 42);

        doc.setFontSize(14);
        doc.text("গ্রাহকের বিবরণ:", 20, 55);
        doc.setFontSize(12);
        doc.text(`নাম: ${order.customerName}`, 20, 62);
        doc.text(`ফোন: ${order.customerPhone}`, 20, 69);
        doc.text(`ঠিকানা: ${order.customerAddress}`, 20, 76);

        doc.setFontSize(14);
        doc.text("অর্ডারকৃত পণ্য:", 20, 89);
        let y = 96;

        doc.setFontSize(10);
        doc.text("পণ্য", 20, y);
        doc.text("পরিমাণ", 100, y);
        doc.text("মূল্য (প্রতি ইউনিট)", 130, y);
        doc.text("মোট", 180, y, null, null, "right");
        y += 7;

        order.items.forEach(item => {
            doc.text(`${item.name} (${item.nameEn})`, 20, y);
            doc.text(`${item.quantity} ${item.unit}`, 100, y);
            doc.text(`${item.price} টাকা`, 130, y);
            doc.text(`${item.totalItemPrice} টাকা`, 180, y, null, null, "right");
            y += 7;
        });

        y += 10;
        doc.setFontSize(14);
        doc.text(`মোট বিল: ${order.totalBill} টাকা`, 180, y, null, null, "right");

        y += 10;
        doc.setFontSize(10);
        doc.text("ধন্যবাদ!", 105, y + 20, null, null, "center");
        doc.text("খুলনা মাছ ঘরের সাথে থাকার জন্য।", 105, y + 27, null, null, "center");

        doc.save(`KhulnaMachGhar_Order_${order.orderCode}.pdf`);
    }

    // --- Floating Cart Button Dragging Functionality ---
    let isDragging = false;
    let offsetX, offsetY;

    floatingCartButton.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - floatingCartButton.getBoundingClientRect().left;
        offsetY = e.clientY - floatingCartButton.getBoundingClientRect().top;
        floatingCartButton.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent text selection during drag

        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        // Keep the button within viewport boundaries
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - floatingCartButton.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - floatingCartButton.offsetHeight));

        floatingCartButton.style.left = `${newLeft}px`;
        floatingCartButton.style.top = `${newTop}px`;
        // Clear right/bottom styles to ensure left/top takes precedence during drag
        floatingCartButton.style.right = 'auto';
        floatingCartButton.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        floatingCartButton.style.cursor = 'grab';
    });

    // Touch events for dragging on mobile devices
    floatingCartButton.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - floatingCartButton.getBoundingClientRect().left;
        offsetY = touch.clientY - floatingCartButton.getBoundingClientRect().top;
        floatingCartButton.style.cursor = 'grabbing';
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        let newLeft = touch.clientX - offsetX;
        let newTop = touch.clientY - offsetY;

        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - floatingCartButton.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - floatingCartButton.offsetHeight));

        floatingCartButton.style.left = `${newLeft}px`;
        floatingCartButton.style.top = `${newTop}px`;
        floatingCartButton.style.right = 'auto';
        floatingCartButton.style.bottom = 'auto';
    }, { passive: false });

    document.addEventListener('touchend', () => {
        isDragging = false;
        floatingCartButton.style.cursor = 'grab';
    });


    // Initial setup
    updateCartDisplay();
    loadProductsFromSheet(); // Load products when the page loads
});
