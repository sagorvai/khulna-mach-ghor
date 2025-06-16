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
    const productsSectionContainer = document.querySelector('.products-section .container');
    const productQuantityPopup = document.getElementById('product-quantity-popup'); 
    const popupProductName = document.getElementById('popup-product-name');
    const popupProductNameEn = document.getElementById('popup-product-name-en');
    const popupProductDescription = document.querySelector('.popup-product-description');
    const popupProductImage = document.getElementById('popup-product-image');
    const popupProductPrice = document.getElementById('popup-product-price');
    const popupQuantityInput = document.getElementById('popup-quantity');
    const popupProductUnit = document.getElementById('popup-product-unit');
    const addToCartFromPopupBtn = document.getElementById('add-to-cart-from-popup-btn');
    const closeProductQuantityPopupBtn = document.getElementById('close-product-quantity-popup-btn'); 

    const cartItemsContainer = document.getElementById('cart-items');
    const totalBillSpan = document.getElementById('total-bill');
    const orderForm = document.getElementById('order-form');
    const orderSummaryModal = document.getElementById('order-summary-modal'); 
    const closeOrderSummaryBtn = document.getElementById('close-order-summary-btn'); 

    const invoiceDateSpan = document.getElementById('invoice-date');
    const invoiceOrderCodeSpan = document.getElementById('invoice-order-code');

    const orderSuccessPopup = document.getElementById('order-success-popup');
    const closeSuccessPopupBtn = document.getElementById('close-success-popup-btn');
    const closeSuccessPopupBtnBottom = document.getElementById('close-success-popup-btn-bottom');
    const downloadPdfBtn = document.getElementById('download-pdf-btn'); // Re-added

    const floatingCartButton = document.getElementById('floating-cart-button');
    const cartItemCountSpan = document.getElementById('cart-item-count');

    let cart = [];
    let selectedProduct = null;

    let currentOrderCode = '';
    let currentInvoiceDate = ''; // Will store the Bengali date string

    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzk7ds_HA-wHiGumbysQ7h-4uXcj3QsXrgRRAIwkjhOqwVyWZCFwmdXi6umapfA2JS6/exec"; 

    const dynamicCategoryGrids = new Map();

    async function loadProductsFromSheet() {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
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

    function renderProducts(productsToRender) {
        const existingDynamicContent = productsSectionContainer.querySelectorAll('.product-category');
        existingDynamicContent.forEach(element => element.remove());
        dynamicCategoryGrids.clear();

        productsToRender.forEach(product => {
            if (!product.Name_BN || product.Name_BN.toString().trim() === '' ||
                !product.Price || product.Price.toString().trim() === '' ||
                !product.Category || product.Category.toString().trim() === '') {
                console.warn('Skipping invalid product row (client-side filter):', product);
                return;
            }

            const isAvailable = (product.Available && product.Available.toString().toLowerCase().trim() === 'হ্যাঁ' || 
                                 product.Available && product.Available.toString().toLowerCase().trim() === 'true'); 
            
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            if (!isAvailable) {
                productItem.classList.add('unavailable');
            }

            productItem.dataset.name = product.Name_BN;
            productItem.dataset.nameEn = product.Name_EN || '';
            productItem.dataset.price = product.Price;
            productItem.dataset.unit = product.Unit || 'কেজি';
            productItem.dataset.description = product.Description || 'এই মাছ সম্পর্কে কোনো বিবরণ নেই।';
            productItem.dataset.imageUrl = product['Image URL'] || 'https://placehold.co/300x200/cccccc/333333?text=ছবি+নেই';

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

            const originalCategoryName = product.Category;
            const normalizedCategoryName = originalCategoryName.toString().toLowerCase().trim(); 

            let currentProductGrid = dynamicCategoryGrids.get(normalizedCategoryName);

            if (!currentProductGrid) {
                const categoryDiv = document.createElement('div');
                categoryDiv.classList.add('product-category');

                const categoryHeading = document.createElement('h3');
                categoryHeading.textContent = originalCategoryName; 

                const productGridDiv = document.createElement('div');
                productGridDiv.classList.add('product-grid');
                
                categoryDiv.appendChild(categoryHeading);
                categoryDiv.appendChild(productGridDiv);
                productsSectionContainer.appendChild(categoryDiv);

                dynamicCategoryGrids.set(normalizedCategoryName, productGridDiv);
                currentProductGrid = productGridDiv;
            }

            currentProductGrid.appendChild(productItem); 
        });
    }

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItemCount = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            totalItemCount++;
            
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span class="item-details">★ ${item.name} (${item.quantity} ${item.unit}) × ${item.price} টাকা</span>
                <span class="item-total">${itemTotal} টাকা</span>
                <button class="remove-item-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        totalBillSpan.textContent = total;

        if (totalItemCount > 0) {
            floatingCartButton.style.display = 'flex';
            cartItemCountSpan.textContent = totalItemCount;
        } else {
            floatingCartButton.style.display = 'none';
            cartItemCountSpan.textContent = 0;
            orderSummaryModal.style.display = 'none';
        }

        // --- IMPORTANT: currentInvoiceDate and currentOrderCode are generated ONCE during updateCartDisplay
        // This ensures consistency between what's displayed, sent to sheet, and shown in PDF.
        const now = new Date();
        currentInvoiceDate = now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }); // Bengali date for display
        currentOrderCode = generateOrderCode();

        invoiceDateSpan.textContent = currentInvoiceDate;
        invoiceOrderCodeSpan.textContent = currentOrderCode;
    }

    function generateOrderCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const uniqueId = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `KMG-${year}${month}${day}-${uniqueId}`;
    }

    document.querySelector('.products-section').addEventListener('click', (e) => {
        const productItem = e.target.closest('.product-item');
        const openOrderBtn = e.target.closest('.open-order-form-btn');

        if (productItem && openOrderBtn && !openOrderBtn.disabled) {
            const name = productItem.dataset.name;
            const nameEn = productItem.dataset.nameEn || '';
            const price = parseFloat(productItem.dataset.price);
            const unit = productItem.dataset.unit;
            const description = productItem.dataset.description || 'এই মাছ সম্পর্কে কোনো বিবরণ নেই।';
            const imageUrl = productItem.querySelector('img').src;

            popupProductName.textContent = name;
            popupProductNameEn.textContent = nameEn;
            popupProductDescription.textContent = description;
            popupProductImage.src = imageUrl;
            popupProductPrice.textContent = `${price} টাকা${unit === 'কেজি' ? '/কেজি' : ''}`;
            popupQuantityInput.value = '1';
            popupQuantityInput.min = '0.5';
            popupQuantityInput.step = '0.5';
            popupProductUnit.textContent = unit;
            selectedProduct = { name, nameEn, price, unit, description, imageUrl };
            productQuantityPopup.style.display = 'flex';
        } else if (openOrderBtn && openOrderBtn.disabled) {
            showMessage('স্টক নেই', 'এই পণ্যটি বর্তমানে স্টক নেই।');
        }
    });

    addToCartFromPopupBtn.addEventListener('click', () => {
        if (selectedProduct) {
            const quantity = parseFloat(popupQuantityInput.value);
            if (isNaN(quantity) || quantity <= 0) {
                showMessage('ভুল পরিমাণ', 'দয়া করে সঠিক পরিমাণ দিন।');
                return;
            }

            const existingItemIndex = cart.findIndex(item => item.name === selectedProduct.name);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                cart.push({ ...selectedProduct, quantity });
            }
            updateCartDisplay();
            productQuantityPopup.style.display = 'none';
            selectedProduct = null;
        }
    });

    closeProductQuantityPopupBtn.addEventListener('click', () => {
        productQuantityPopup.style.display = 'none';
        selectedProduct = null;
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            const button = e.target.closest('.remove-item-btn');
            const indexToRemove = parseInt(button.dataset.index);
            cart.splice(indexToRemove, 1);
            updateCartDisplay();
        }
    });

    floatingCartButton.addEventListener('click', () => {
        if (cart.length > 0) {
            updateCartDisplay();
            orderSummaryModal.style.display = 'flex';
        }
    });

    closeOrderSummaryBtn.addEventListener('click', () => {
        orderSummaryModal.style.display = 'none';
    });

    // UPDATED: PDF Generation Function - now accurately populating data from cart and form
    async function generateInvoicePdf(customerData, orderDetails) {
        // This function now expects customerData and orderDetails as arguments
        // This ensures it uses the same data that was sent to Google Sheet
        try {
            const pdf = new window.jspdf.jsPDF('portrait', 'pt', 'a4');
            
            // Set default English font (Helvetica is a good standard)
            pdf.setFont('helvetica', 'normal'); 
            
            let y = 50; // Starting Y position for content
            const lineHeightFactor = 1.2; 
            const leftMargin = 50;
            const rightMargin = pdf.internal.pageSize.width - 50; // Total width - right margin

            // Define column widths array BEFORE calculating column positions
            const tableWidth = pdf.internal.pageSize.width - (2 * leftMargin);
            const colWidthsArray = [
                tableWidth * 0.40, // Item (40%)
                tableWidth * 0.20, // Quantity (20%)
                tableWidth * 0.20, // Unit Price (20%)
                tableWidth * 0.20  // Total Price (20%)
            ];

            // Calculate column positions using the defined colWidthsArray
            const col1X = leftMargin + 5; // Item Name (with left padding)
            const col2X = leftMargin + colWidthsArray[0] + (colWidthsArray[1] / 2); // Quantity (centered relative to its column)
            const col3X = leftMargin + colWidthsArray[0] + colWidthsArray[1] + colWidthsArray[2]; // Unit Price (right aligned relative to its column)
            const col4X = rightMargin - 5; // Total Price (with right padding)

            // Company Header
            pdf.setFontSize(20);
            pdf.text('Khulna Mach Ghar', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (20 * lineHeightFactor);
            pdf.setFontSize(12);
            pdf.text('Formalin-Free Fresh Fish Online Market', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (15 * lineHeightFactor);
            pdf.setFontSize(10);
            pdf.text('City Bypass Road Mostofa More, Harintana, Khulna.', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (12 * lineHeightFactor);
            pdf.text('Contact: +8801753903854, +8801951912031', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (30 * lineHeightFactor);

            // Invoice Details
            pdf.setFontSize(14);
            pdf.text('INVOICE:', leftMargin, y);
            y += (15 * lineHeightFactor);
            
            // Use the date from orderDetails
            pdf.text(`Date: ${orderDetails.orderDate}`, leftMargin, y); 
            y += (15 * lineHeightFactor);
            // Use the order code from orderDetails
            pdf.text(`Order Code: ${orderDetails.orderCode}`, leftMargin, y);
            y += (30 * lineHeightFactor);

            // Table Header
            pdf.setFontSize(12);
            pdf.setFillColor(242, 242, 242); // Light gray background for header
            const headerHeight = 20;
            pdf.rect(leftMargin, y, tableWidth, headerHeight, 'F'); 
            pdf.setTextColor(0, 0, 0);
            
            pdf.text('Item', col1X, y + (headerHeight / 2) + 4); 
            pdf.text('Quantity', col2X, y + (headerHeight / 2) + 4, { align: 'center' }); // Align to column center
            pdf.text('Unit Price', col3X, y + (headerHeight / 2) + 4, { align: 'right' }); // Align to column end
            pdf.text('Total Price', col4X, y + (headerHeight / 2) + 4, { align: 'right' }); // Align to column end
            y += headerHeight;

            // Table Rows
            pdf.setFontSize(11);
            orderDetails.items.forEach(item => { // Loop through items from orderDetails
                // For PDF, use English product names if available, otherwise Bengali will show as squares/garbled
                const itemNameForPdf = item.nameEn && item.nameEn.trim() !== '' ? item.nameEn : item.name;
                
                // Calculate max width for item name to fit into its column
                const maxItemNameWidth = colWidthsArray[0] - 10; // Column width minus padding
                const productNameLines = pdf.splitTextToSize(itemNameForPdf, maxItemNameWidth); 
                
                // Calculate row height based on number of lines for product name
                const textLineHeight = pdf.getFontSize() * lineHeightFactor;
                let rowHeight = productNameLines.length * textLineHeight;
                if (rowHeight < 20) rowHeight = 20; // Minimum row height to ensure spacing

                // Draw cell background for this row (optional, can be alternating colors)
                pdf.rect(leftMargin, y, tableWidth, rowHeight, 'S'); // 'S' for stroke (border only)

                // Add text content
                pdf.text(productNameLines, col1X, y + (textLineHeight * 0.75)); 
                pdf.text(`${item.quantity} ${item.unit === 'কেজি' ? 'KG' : item.unit}`, col2X, y + (textLineHeight * 0.75), { align: 'center' });
                pdf.text(`${item.price} BDT`, col3X, y + (textLineHeight * 0.75), { align: 'right' });
                pdf.text(`${item.totalItemPrice} BDT`, col4X, y + (textLineHeight * 0.75), { align: 'right' });
                
                y += rowHeight;

                // Page breaking logic
                if (y > pdf.internal.pageSize.height - 150 && orderDetails.items.indexOf(item) < orderDetails.items.length - 1) {
                    pdf.addPage();
                    y = 50; 
                    // Redraw header on new page
                    pdf.setFontSize(12);
                    pdf.setFillColor(242, 242, 242);
                    pdf.rect(leftMargin, y, tableWidth, headerHeight, 'F');
                    pdf.setTextColor(0, 0, 0);
                    pdf.text('Item', col1X, y + (headerHeight / 2) + 4);
                    pdf.text('Quantity', col2X, y + (headerHeight / 2) + 4, { align: 'center' });
                    pdf.text('Unit Price', col3X, y + (headerHeight / 2) + 4, { align: 'right' });
                    pdf.text('Total Price', col4X, y + (headerHeight / 2) + 4, { align: 'right' });
                    y += headerHeight;
                    pdf.setFontSize(11); // Reset font size for content
                }
            });

            y += (20 * lineHeightFactor); // Space after table

            // Total Bill
            pdf.setFontSize(16);
            pdf.text('Total Bill:', rightMargin - 125, y, { align: 'right' }); // Adjusted position
            pdf.setFontSize(20);
            pdf.text(`${orderDetails.totalBill} BDT`, rightMargin, y + 5, { align: 'right' });
            y += (30 * lineHeightFactor);

            // Customer Information
            pdf.setFontSize(12);
            pdf.text('Customer Name: ' + customerData.customerName, leftMargin, y);
            y += (15 * lineHeightFactor);
            pdf.text('Mobile No: ' + customerData.customerPhone, leftMargin, y);
            y += (15 * lineHeightFactor);
            
            // Split long address into multiple lines with a defined width
            const customerAddressText = 'Address: ' + customerData.customerAddress;
            const addressTextWidth = tableWidth; // Use the same width as table
            const addressLines = pdf.splitTextToSize(customerAddressText, addressTextWidth);
            
            pdf.text(addressLines, leftMargin, y);
            y += addressLines.length * (pdf.getFontSize() * lineHeightFactor); 
            y += (20 * lineHeightFactor);

            // Thank You Message
            pdf.setFontSize(10);
            pdf.text('Thank you for staying with Khulna Mach Ghar!', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (12 * lineHeightFactor);
            pdf.text('Your trust is our inspiration.', pdf.internal.pageSize.width / 2, y, { align: 'center' });

            pdf.save(`Invoice_${orderDetails.orderCode}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            showMessage('PDF Generation Issue', 'Failed to generate PDF invoice. Please try again. Error: ' + error.message);
        }
    }

    // MODIFIED: downloadPdfBtn click listener now receives the correct orderData
    downloadPdfBtn.addEventListener('click', () => {
        // Ensure customer data and cart are still available
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerAddress = document.getElementById('customer-address').value;

        // Create customerData and orderDetails objects directly from current state
        // This is important because the form might have been reset if orderForm.submit completed.
        // We need to pass the *original* data that was sent to the sheet.
        // For simplicity here, we're taking from the DOM for PDF,
        // but for absolute consistency, you'd store the orderData object from the submit event.
        // Re-construct the order data if the form was reset
        const customerDataForPdf = {
            customerName: customerName || 'N/A',
            customerPhone: customerPhone || 'N/A',
            customerAddress: customerAddress || 'N/A'
        };
        const orderDetailsForPdf = {
            items: cart.map(item => ({ // Use the current state of the cart (it's cleared after submission)
                name: item.name,
                nameEn: item.nameEn,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                totalItemPrice: item.quantity * item.price
            })),
            totalBill: parseFloat(totalBillSpan.textContent) || 0,
            orderDate: currentInvoiceDate, // Use the date generated for the order
            orderCode: currentOrderCode // Use the order code generated for the order
        };
        
        // Before calling generateInvoicePdf, ensure cart and customer details are passed as arguments
        // IMPORTANT: The cart is reset after successful order submission. 
        // If the user clicks "Download PDF" *after* the order is submitted, the cart will be empty.
        // To fix this, we need to store the orderData somewhere *before* resetting the cart.
        // For now, I'm passing the `currentOrderData` that was *just submitted*.
        // A better approach would be to pass `orderData` from the `submit` event to `generateInvoicePdf`.
        // Let's modify the `submit` event listener to store the `orderData` globally or pass it directly.

        // Re-fetching or storing the order data is crucial. Let's make it simpler:
        // We will make `generateInvoicePdf` directly use the form fields and a temporary cart state
        // OR pass the submitted `orderData` to it.
        // The most robust way is to pass the `orderData` from the `submit` event.
        // I will make `generateInvoicePdf` accept `orderData` as a parameter.
        
        // This button click happens *after* the order is submitted and cart is cleared.
        // We need to retrieve the *submitted* order details.
        // A simple way for now is to rely on global `currentOrderCode` and `currentInvoiceDate`
        // and re-collecting customer data and a *copy* of the cart BEFORE clearing it.
        // Let's modify the `orderForm.submit` to temporarily store the `orderData` for PDF.
        
        // This part needs the data that was *just submitted*.
        // Let's store the `orderData` globally after submission for PDF generation.
        if (lastSubmittedOrderData) { // Check if previous order data exists
            generateInvoicePdf(
                { 
                    customerName: lastSubmittedOrderData.customerName,
                    customerPhone: lastSubmittedOrderData.customerPhone,
                    customerAddress: lastSubmittedOrderData.customerAddress
                }, 
                {
                    items: lastSubmittedOrderData.items,
                    totalBill: lastSubmittedOrderData.totalBill,
                    orderDate: lastSubmittedOrderData.orderDate,
                    orderCode: lastSubmittedOrderData.orderCode
                }
            );
        } else {
            showMessage('PDF Error', 'No recent order data found to generate PDF.');
        }
    });

    let lastSubmittedOrderData = null; // Global variable to store last submitted order data

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            showMessage('অর্ডার ত্রুটি', 'অর্ডার করার জন্য কোনো পণ্য নির্বাচন করা হয়নি।');
            return;
        }

        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerAddress = document.getElementById('customer-address').value;
        
        if (!customerName || !customerPhone || !customerAddress) {
            showMessage('তথ্য পূরণ করুন', 'দয়া করে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করুন।');
            return;
        }

        const orderData = {
            customerName: customerName,
            customerPhone: customerPhone,
            customerAddress: customerAddress,
            items: cart.map(item => ({ 
                name: item.name,
                nameEn: item.nameEn, // Include English name if available
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                totalItemPrice: item.quantity * item.price
            })),
            totalBill: parseFloat(totalBillSpan.textContent),
            orderDate: currentInvoiceDate, // Use the date generated for display
            orderCode: currentOrderCode // Use the order code generated for display
        };

        // Store the orderData before resetting the cart
        lastSubmittedOrderData = orderData; 

        try {
            const loadingMessageTitle = 'অর্ডার প্রক্রিয়া চলছে...';
            const loadingMessageText = 'আপনার অর্ডার জমা দেওয়া হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...';
            showMessage(loadingMessageTitle, loadingMessageText); 

            // Make sure the form submission UI (orderSummaryModal) is hidden during API call
            orderSummaryModal.style.display = 'none';

            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { 
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData), 
            });

            console.log('Order data sent to Google Sheet (check your sheet)!');

            // Hide the loading message and show success popup
            document.getElementById('message-box-overlay').style.display = 'none';
            orderSuccessPopup.style.display = 'flex'; 

            orderForm.reset();
            cart = [];
            updateCartDisplay(); // This will clear the floating cart button
            
        } catch (error) {
            console.error('Error sending order:', error);
            // Hide the loading message and show error message
            document.getElementById('message-box-overlay').style.display = 'none';
            showMessage('অর্ডার জমা দিতে সমস্যা', 'অর্ডার জমা দিতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।');
        }
    });

    closeSuccessPopupBtn.addEventListener('click', () => {
        orderSuccessPopup.style.display = 'none';
    });
    
    closeSuccessPopupBtnBottom.addEventListener('click', () => {
        orderSuccessPopup.style.display = 'none';
    });

    // Floating Button Drag Functionality
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
    loadProductsFromSheet();
});
