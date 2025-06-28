// Global function to display custom messages instead of alert()
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
    // --- DOM Element References ---
    const productCategoriesContainer = document.getElementById('product-categories-container');

    const productQuantityPopup = document.getElementById('product-quantity-popup');
    const closeQuantityPopupBtn = document.getElementById('close-quantity-popup-btn');
    const popupProductImage = document.getElementById('popup-product-image');
    const popupProductName = document.getElementById('popup-product-name');
    const popupProductNameEn = document.getElementById('popup-product-name-en'); // For English name if applicable
    const popupProductDescription = document.getElementById('popup-product-description');
    const popupProductPrice = document.getElementById('popup-product-price');
    const productQuantityInput = document.getElementById('product-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    const floatingCartButton = document.getElementById('floating-cart-button');
    const cartItemCountSpan = document.getElementById('cart-item-count');

    // MODIFIED: Reference the new full-page element
    const orderSummaryPage = document.getElementById('order-summary-page');
    const closeOrderSummaryBtn = document.getElementById('close-order-summary-btn');
    const orderDateSpan = document.getElementById('order-date');
    const orderUniqueCodeSpan = document.getElementById('order-unique-code');
    const cartItemsContainer = document.getElementById('cart-items-container'); // Changed from cartSummaryItemsContainer
    const finalTotalBillSpan = document.getElementById('final-total-bill');
    const customerMobileDisplay = document.getElementById('customer-mobile-display'); // For displaying mobile in summary
    const bKashTotalSpan = document.getElementById('bKash-total');
    const paymentForm = document.getElementById('payment-form');
    const bKashTxnIdInput = document.getElementById('bKash-txn-id');
    const bKashSenderNumInput = document.getElementById('bKash-sender-num');

    const orderSuccessPopup = document.getElementById('order-success-popup');
    const closeSuccessPopupBtn = document.getElementById('close-success-popup-btn');
    const closeSuccessPopupBtnBottom = document.getElementById('close-success-popup-btn-bottom');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const whatsappShareBtn = document.getElementById('whatsapp-share-btn');


    // --- Global Variables ---
    let cart = [];
    let selectedProduct = null;
    let currentOrderCode = '';
    let currentOrderDate = ''; // Will store English date string for PDF
    let lastSubmittedOrderData = null; // To hold data for PDF download

    // --- GOOGLE APPS SCRIPT URLs ---
    const GOOGLE_APPS_SCRIPT_PRODUCTS_URL = "https://script.google.com/macros/s/AKfycbyecR4VKIJ2K5n_3gAjnUFZm4seZWUtL8lMQGuY0o1LIIDwCvHpLCyFhkacqz3rc2SG1w/exec"; 
    const GOOGLE_APPS_SCRIPT_ORDERS_URL = "https://script.google.com/macros/s/AKfycbyBGei3PDbYmWf1aL4FTWgX8ncQd9fZ3aORFKwPH2dnEZDgzEAV67jK2wvv-_fwlXv/exec";   
    // --- END OF URLS ---

    // --- Helper Functions ---

    // Function to convert Bengali numbers to English numbers for processing/PDF
    function convertBengaliNumbersToEnglish(inputString) {
        if (!inputString) return '';
        const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let convertedString = '';
        for (let i = 0; i < inputString.length; i++) {
            const char = inputString[i];
            const index = bengaliNumbers.indexOf(char);
            if (index !== -1) {
                convertedString += englishNumbers[index];
            } else {
                convertedString += char;
            }
        }
        return convertedString;
    }

    // Generate a unique order code
    function generateOrderCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const uniqueId = Math.random().toString(36).substr(2, 4).toUpperCase(); // Random 4-char string
        return `KMG-${year}${month}${day}-${uniqueId}`; // KMG for Khulna Mach Ghar
    }

    // Update cart display and floating button visibility
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = ''; // Changed from cartSummaryItemsContainer
        let total = 0;
        let totalItemCount = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            totalItemCount += item.quantity; // Summing up quantities for total count

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span class="item-details">★ ${item.name} (${item.quantity} ${item.unit}) × ${item.price} টাকা</span>
                <span class="item-total">${itemTotal} টাকা</span>
                <button class="remove-item-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        finalTotalBillSpan.textContent = total;
        bKashTotalSpan.textContent = total; // For bKash instructions

        if (cart.length > 0) { // Check cart array length, not totalItemCount
            floatingCartButton.style.display = 'flex';
            cartItemCountSpan.textContent = cart.length; // Show number of distinct items
        } else {
            floatingCartButton.style.display = 'none';
            cartItemCountSpan.textContent = 0;
            orderSummaryPage.style.display = 'none'; // Hide the page if cart is empty
        }

        const now = new Date();
        currentOrderDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // English date for PDF
        currentOrderCode = generateOrderCode();

        orderDateSpan.textContent = currentOrderDate;
        orderUniqueCodeSpan.textContent = currentOrderCode;
    }

    // --- Data Loading from Google Sheet ---
    async function loadProductsFromSheet() {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_PRODUCTS_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const productsData = await response.json();
            
            if (productsData.error) {
                showMessage('পণ্য লোড করতে সমস্যা', 'Apps Script থেকে পণ্য ডেটা লোড করা যায়নি: ' + productsData.error);
                console.error('Apps Script Error:', productsData.error);
                return;
            }
            renderProducts(productsData);

        } catch (error) {
            console.error('Error loading products from sheet:', error);
            showMessage('পণ্য লোড করতে সমস্যা', 'পণ্য তালিকা লোড করা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
        }
    }

    // Render products into categories
    function renderProducts(productsToRender) {
        productCategoriesContainer.innerHTML = '';
        const categoriesMap = new Map();

        productsToRender.forEach(product => {
            if (!product.Name || !product.Price || !product.Category) {
                console.warn('Skipping invalid product row:', product);
                return;
            }

            const categoryName = product.Category.trim();
            if (!categoriesMap.has(categoryName)) {
                categoriesMap.set(categoryName, []);
            }
            categoriesMap.get(categoryName).push(product);
        });

        categoriesMap.forEach((products, categoryName) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('product-category');
            categoryDiv.innerHTML = `<h3>${categoryName}</h3><div class="product-grid"></div>`;
            const productGrid = categoryDiv.querySelector('.product-grid');

            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.classList.add('product-item');
                if (product.Availability && product.Availability.toLowerCase() === 'no') {
                    productItem.classList.add('unavailable');
                }

                productItem.innerHTML = `
                    <img src="${product['Image URL'] || 'https://placehold.co/300x200/cccccc/333333?text=ছবি+নেই'}" alt="${product.Name}">
                    <div class="product-bottom-section">
                        <div class="product-info-inline">
                            <h4>${product.Name}</h4>
                            ${product['English Name'] ? `<p>${product['English Name']}</p>` : ''}
                            <p>${product.Description || 'কোনো বিবরণ নেই।'}</p>
                            <p class="price">${product.Price} টাকা (${product.Unit || 'কেজি'})</p>
                        </div>
                        <button class="open-order-form-btn ${product.Availability && product.Availability.toLowerCase() === 'no' ? 'unavailable-btn' : ''}" 
                                ${product.Availability && product.Availability.toLowerCase() === 'no' ? 'disabled' : ''}
                                data-product='${JSON.stringify(product)}'>
                            ${product.Availability && product.Availability.toLowerCase() === 'no' ? 'স্টক নেই' : 'অর্ডার দিন ও যুক্ত করুন'}
                        </button>
                    </div>
                `;
                
                productGrid.appendChild(productItem);
            });
            productCategoriesContainer.appendChild(categoryDiv);
        });

        // Add event listeners to "অর্ডার দিন ও যুক্ত করুন" buttons
        document.querySelectorAll('.open-order-form-btn:not(.unavailable-btn)').forEach(button => {
            button.addEventListener('click', (e) => {
                const productData = JSON.parse(e.currentTarget.dataset.product);
                selectedProduct = {
                    name: productData.Name,
                    name_en: productData['English Name'] || '',
                    description: productData.Description || 'কোনো বিবরণ নেই।',
                    price: parseFloat(productData.Price),
                    unit: productData.Unit || 'কেজি',
                    imageUrl: productData['Image URL'] || 'https://placehold.co/300x200/cccccc/333333?text=ছবি+নেই'
                };
                
                popupProductImage.src = selectedProduct.imageUrl;
                popupProductName.textContent = selectedProduct.name;
                popupProductNameEn.textContent = selectedProduct.name_en;
                popupProductDescription.textContent = selectedProduct.description;
                popupProductPrice.textContent = selectedProduct.price;
                productQuantityInput.value = 1; // Reset quantity to 1
                productQuantityPopup.style.display = 'flex';
            });
        });
    }

    // --- Event Listeners ---

    // Close Quantity Popup
    closeQuantityPopupBtn.addEventListener('click', () => {
        productQuantityPopup.style.display = 'none';
        selectedProduct = null;
    });

    // Add to Cart from Quantity Popup
    addToCartBtn.addEventListener('click', () => {
        if (!selectedProduct) {
            showMessage('ত্রুটি', 'কোনো পণ্য নির্বাচন করা হয়নি।');
            return;
        }

        const quantity = parseFloat(productQuantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            showMessage('পরিমাণ ত্রুটি', 'দয়া করে সঠিক পরিমাণ লিখুন।');
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.name === selectedProduct.name);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ ...selectedProduct, quantity: quantity });
        }

        showMessage('সফল!', `${selectedProduct.name} কার্টে যুক্ত হয়েছে।`);
        productQuantityPopup.style.display = 'none';
        selectedProduct = null; // Clear selected product
        updateCartDisplay();
    });

    // Handle removing item from cart summary
    cartItemsContainer.addEventListener('click', (e) => { // Changed from cartSummaryItemsContainer
        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            const button = e.target.closest('.remove-item-btn');
            const indexToRemove = parseInt(button.dataset.index);
            cart.splice(indexToRemove, 1);
            updateCartDisplay();
        }
    });

    // Floating Cart Button click to open Order Summary PAGE
    floatingCartButton.addEventListener('click', () => {
        if (cart.length > 0) {
            updateCartDisplay(); // Refresh display before showing
            // Show the order summary page and hide main content
            document.body.classList.add('no-scroll'); // Add class to body to prevent scrolling
            orderSummaryPage.style.display = 'flex';
        }
    });

    // Close Order Summary PAGE
    closeOrderSummaryBtn.addEventListener('click', () => {
        orderSummaryPage.style.display = 'none';
        document.body.classList.remove('no-scroll'); // Remove class to allow scrolling
    });

    // Payment Form Submission (Final Order Placement)
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            showMessage('ত্রুটি', 'কোনো পণ্য নির্বাচন করা হয়নি।');
            return;
        }

        const bKashTxnId = bKashTxnIdInput.value.trim();
        const bKashSenderNum = convertBengaliNumbersToEnglish(bKashSenderNumInput.value.trim());

        if (!bKashTxnId || !bKashSenderNum) {
            showMessage('তথ্য পূরণ করুন', 'দয়া করে বিকাশ Transaction ID এবং আপনার বিকাশ নম্বর পূরণ করুন।');
            return;
        }

        // Get customer mobile from bKashSenderNum for display in PDF
        const customerMobile = bKashSenderNum;

        // Prepare data for Google Sheet
        const orderDataForSheet = {
            orderCode: currentOrderCode,
            orderDate: currentOrderDate,
            customerMobile: customerMobile, // Using bKashSenderNum as customerMobile
            paymentMethod: 'bKash',
            bKashTxnId: bKashTxnId,
            bKashSenderNum: bKashSenderNum,
            totalBill: parseFloat(finalTotalBillSpan.textContent),
            products: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit,
                total: item.quantity * item.price
            }))
        };

        lastSubmittedOrderData = orderDataForSheet; // Save for PDF generation

        try {
            const loadingMessageTitle = 'অর্ডার প্রক্রিয়া চলছে...';
            const loadingMessageText = 'আপনার অর্ডার জমা দেওয়া হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...';
            showMessage(loadingMessageTitle, loadingMessageText);

            orderSummaryPage.style.display = 'none'; // Hide order summary page

            // Send order data to Google Sheet
            const response = await fetch(GOOGLE_APPS_SCRIPT_ORDERS_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script POST requests
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDataForSheet),
            });

            console.log('Order data sent to Google Sheet (check your sheet)!');
            
            document.getElementById('message-box-overlay').style.display = 'none'; // Hide loading message
            orderSuccessPopup.style.display = 'flex'; // Show success popup

            // Update WhatsApp share button with dynamic order code and customer mobile
            const whatsappMessage = `প্রিয় খুলনা মাছ ঘর টিম, আমার অর্ডার কোড: ${currentOrderCode}%0Aআমার মোবাইল: ${customerMobile}%0A%0Aআমি আমার অর্ডারের বিবরণ শেয়ার করতে চাই।`;
            whatsappShareBtn.href = `https://wa.me/8801951912031?text=${encodeURIComponent(whatsappMessage)}`;

            // Display mobile number on success popup (if needed)
            customerMobileDisplay.textContent = customerMobile;


            // Clear cart and form after successful order
            cart = [];
            paymentForm.reset();
            bKashTxnIdInput.value = '';
            bKashSenderNumInput.value = '';
            updateCartDisplay();
            document.body.classList.remove('no-scroll'); // Re-enable body scrolling

        } catch (error) {
            console.error('Error sending order:', error);
            document.getElementById('message-box-overlay').style.display = 'none'; // Hide loading
            showMessage('অর্ডার জমা দিতে সমস্যা', 'অর্ডার জমা দিতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।');
            document.body.classList.remove('no-scroll'); // Re-enable body scrolling
        }
    });

    // --- PDF Generation Function ---
    async function generateInvoicePdf(orderData) {
        try {
            const pdf = new window.jspdf.jsPDF('portrait', 'pt', 'a4');
            pdf.setFont('helvetica', 'normal');
            
            let y = 50;
            const lineHeightFactor = 1.2;
            const leftMargin = 50;
            const rightMargin = pdf.internal.pageSize.width - 50;
            const tableWidth = pdf.internal.pageSize.width - (2 * leftMargin);

            // Columns for item table
            const colWidthsArray = [
                tableWidth * 0.40, // Item Name (40%)
                tableWidth * 0.20, // Quantity (20%)
                tableWidth * 0.15, // Price per Unit (15%)
                tableWidth * 0.25  // Total Price (25%)
            ];

            const col1X = leftMargin + 5;
            const col2X = leftMargin + colWidthsArray[0] + 5;
            const col3X = leftMargin + colWidthsArray[0] + colWidthsArray[1] + 5;
            const col4X = rightMargin - 5; // Align total price to right

            // Company Header
            pdf.setFontSize(20);
            pdf.text('খুলনা মাছ ঘর', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (20 * lineHeightFactor);
            pdf.setFontSize(12);
            pdf.text('আপনার বিশ্বস্ত তাজা মাছের উৎস', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (15 * lineHeightFactor);
            pdf.setFontSize(10);
            pdf.text('যোগাযোগ: +8801951912031 | info@khulnamachghar.com', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (30 * lineHeightFactor);

            // Invoice Details
            pdf.setFontSize(14);
            pdf.text('চালান:', leftMargin, y);
            y += (15 * lineHeightFactor);
            
            pdf.text(`তারিখ: ${orderData.orderDate}`, leftMargin, y);
            y += (15 * lineHeightFactor);
            pdf.text(`অর্ডার কোড: ${orderData.orderCode}`, leftMargin, y);
            y += (30 * lineHeightFactor);

            // Customer Information (Only Mobile Number)
            pdf.setFontSize(12);
            pdf.text('গ্রাহকের মোবাইল নং: ' + orderData.customerMobile, leftMargin, y);
            y += (20 * lineHeightFactor);


            // Table Header
            pdf.setFontSize(12);
            pdf.setFillColor(242, 242, 242);
            const headerHeight = 20;
            pdf.rect(leftMargin, y, tableWidth, headerHeight, 'F');
            pdf.setTextColor(0, 0, 0);
            
            pdf.text('পণ্য', col1X, y + (headerHeight / 2) + 4);
            pdf.text('পরিমাণ', col2X, y + (headerHeight / 2) + 4);
            pdf.text('দাম/ইউনিট', col3X, y + (headerHeight / 2) + 4);
            pdf.text('মোট দাম', col4X, y + (headerHeight / 2) + 4, { align: 'right' });
            y += headerHeight;

            // Table Rows
            pdf.setFontSize(10); // Slightly smaller for item details
            orderData.products.forEach(item => {
                const itemName = item.name;
                const itemQuantity = `${item.quantity} ${item.unit}`;
                const itemPricePerUnit = `${item.price} টাকা`;
                const itemTotalPrice = `${item.total} টাকা`;

                const textLineHeight = pdf.getFontSize() * lineHeightFactor;
                let rowHeight = textLineHeight; // Default for single line

                pdf.rect(leftMargin, y, tableWidth, rowHeight, 'S');

                pdf.text(itemName, col1X, y + (textLineHeight * 0.75));
                pdf.text(itemQuantity, col2X, y + (textLineHeight * 0.75));
                pdf.text(itemPricePerUnit, col3X, y + (textLineHeight * 0.75));
                pdf.text(itemTotalPrice, col4X, y + (textLineHeight * 0.75), { align: 'right' });
                
                y += rowHeight;

                // Page breaking logic
                if (y > pdf.internal.pageSize.height - 150 && orderData.products.indexOf(item) < orderData.products.length - 1) {
                    pdf.addPage();
                    y = 50;
                    pdf.setFontSize(12);
                    pdf.setFillColor(242, 242, 242);
                    pdf.rect(leftMargin, y, tableWidth, headerHeight, 'F');
                    pdf.setTextColor(0, 0, 0);
                    pdf.text('পণ্য', col1X, y + (headerHeight / 2) + 4);
                    pdf.text('পরিমাণ', col2X, y + (headerHeight / 2) + 4);
                    pdf.text('দাম/ইউনিট', col3X, y + (headerHeight / 2) + 4);
                    pdf.text('মোট দাম', col4X, y + (headerHeight / 2) + 4, { align: 'right' });
                    y += headerHeight;
                    pdf.setFontSize(10);
                }
            });

            y += (20 * lineHeightFactor);

            // Total Bill
            pdf.setFontSize(16);
            pdf.text('মোট বিল:', rightMargin - 125, y, { align: 'right' });
            pdf.setFontSize(20);
            pdf.text(`${orderData.totalBill} টাকা`, rightMargin, y + 5, { align: 'right' });
            y += (20 * lineHeightFactor);

            // Payment Info
            pdf.setFontSize(12);
            pdf.text('পেমেন্ট পদ্ধতি: বিকাশ', leftMargin, y);
            y += (15 * lineHeightFactor);
            pdf.text('ট্রানজেকশন আইডি: ' + orderData.bKashTxnId, leftMargin, y);
            y += (15 * lineHeightFactor);
            pdf.text('বিকাশ নম্বর: ' + orderData.bKashSenderNum, leftMargin, y);
            y += (30 * lineHeightFactor);

            // Important Note for Files
            pdf.setFontSize(10);
            pdf.text('গুরুত্বপূর্ণ: অর্ডার কোড উল্লেখ করে আপনার অর্ডারের বিবরণ WhatsApp-এ +8801951912031 নম্বরে শেয়ার করুন।', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (20 * lineHeightFactor);

            // Thank You Message
            pdf.setFontSize(10);
            pdf.text('খুলনা মাছ ঘরের সাথে থাকার জন্য ধন্যবাদ!', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (12 * lineHeightFactor);
            pdf.text('আপনার বিশ্বস্ত তাজা মাছের উৎস।', pdf.internal.pageSize.width / 2, y, { align: 'center' });

            pdf.save(`চালান_খুলনা_মাছ_ঘর_${orderData.orderCode}.pdf`);

        } catch (error) {
            console.error('PDF জেনারেট করতে সমস্যা:', error);
            showMessage('PDF জেনারেট করতে সমস্যা', 'চালান তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন। ত্রুটি: ' + error.message);
        }
    }

    // --- Popup Close Event Listeners ---
    closeSuccessPopupBtn.addEventListener('click', () => {
        orderSuccessPopup.style.display = 'none';
    });
    
    closeSuccessPopupBtnBottom.addEventListener('click', () => {
        orderSuccessPopup.style.display = 'none';
    });

    downloadPdfBtn.addEventListener('click', () => {
        if (lastSubmittedOrderData) {
            generateInvoicePdf(lastSubmittedOrderData);
        } else {
            showMessage('পিডিএফ ত্রুটি', 'পিডিএফ তৈরি করার জন্য কোনো অর্ডারের তথ্য নেই।');
        }
    });

    // --- Floating Button Drag Functionality ---
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
        e.preventDefault();

        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - floatingCartButton.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - floatingCartButton.offsetHeight));

        floatingCartButton.style.left = `${newLeft}px`;
        floatingCartButton.style.top = `${newTop}px`;
        floatingCartButton.style.right = 'auto'; // Disable right/bottom if setting left/top
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
    }, { passive: true }); // Use passive: true for better scroll performance

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling while dragging

        const touch = e.touches[0];
        let newLeft = touch.clientX - offsetX;
        let newTop = touch.clientY - offsetY;

        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - floatingCartButton.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - floatingCartButton.offsetHeight));

        floatingCartButton.style.left = `${newLeft}px`;
        floatingCartButton.style.top = `${newTop}px`;
        floatingCartButton.style.right = 'auto';
        floatingCartButton.style.bottom = 'auto';
    }, { passive: false }); // Use passive: false to allow preventDefault

    document.addEventListener('touchend', () => {
        isDragging = false;
        floatingCartButton.style.cursor = 'grab';
    });

    // Class to prevent body scrolling when a full-page overlay is active
    // This needs to be applied/removed to the body element in JS
    // Add `body.no-scroll { overflow: hidden; }` to CSS.
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule('body.no-scroll { overflow: hidden; }', styleSheet.cssRules.length);


    // Initial setup
    updateCartDisplay(); // Initialize cart display
    loadProductsFromSheet(); // Load products when page loads
});
