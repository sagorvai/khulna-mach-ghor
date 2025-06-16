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
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

    const floatingCartButton = document.getElementById('floating-cart-button');
    const cartItemCountSpan = document.getElementById('cart-item-count');

    let cart = [];
    let selectedProduct = null;

    let currentOrderCode = '';
    let currentInvoiceDate = '';

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
            // Corrected: Formatted string for item details and item total
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

        const now = new Date();
        currentInvoiceDate = now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
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

    // NEW: PDF Generation Function - using jsPDF direct text rendering with Noto Sans Bengali font
    async function generateInvoicePdf() {
        try {
            const pdf = new window.jspdf.jsPDF('portrait', 'pt', 'a4');

            // --- IMPORTANT: Set the Noto Sans Bengali font ---
            // The NotoSansBengali-Regular-normal.js script (loaded in index.html)
            // is expected to have already added this font to jsPDF's internal font list
            // via jsPDF.API.events.push. So, we just need to set it as the active font.
            pdf.setFont('Noto Sans Bengali', 'normal');
            // --- End Font Setup ---
            
            let y = 50; // Starting Y position for content

            // Set line height factor for better spacing
            const lineHeightFactor = 1.2; 

            // Company Header
            pdf.setFontSize(20);
            pdf.text('খুলনা মাছ ঘর', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (20 * lineHeightFactor);
            pdf.setFontSize(12);
            pdf.text('ফরমালিন মুক্ত বিষবিহীন তাজা মাছের অনলাইন বাজার', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (15 * lineHeightFactor);
            pdf.setFontSize(10);
            pdf.text('সিটি বাইপাস সড়ক মোস্তফা মোড়, হরিণটানা, খুলনা।', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (12 * lineHeightFactor);
            pdf.text('যোগাযোগ: ০১৭৫৩৯০৩৮৫৪, ০১৯৫১৯১২০৩১', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (30 * lineHeightFactor);

            // Invoice Details
            pdf.setFontSize(14);
            pdf.text('চালান:', 50, y);
            y += (15 * lineHeightFactor);
            pdf.text(`তারিখ: ${currentInvoiceDate}`, 50, y);
            y += (15 * lineHeightFactor);
            pdf.text(`অর্ডার কোড: ${currentOrderCode}`, 50, y);
            y += (30 * lineHeightFactor);

            // Table Header
            pdf.setFontSize(12);
            pdf.setFillColor(242, 242, 242); // Light gray background for header
            // Draw filled rectangle for header background, adjust width if needed
            const tableWidth = pdf.internal.pageSize.width - 100;
            const headerHeight = 20;
            pdf.rect(50, y, tableWidth, headerHeight, 'F'); 
            pdf.setTextColor(0, 0, 0);
            
            // Define column widths and starting X positions for precise alignment
            // Adjusted column widths for better text fitting
            const col1X = 55; // পণ্য (Product Name)
            const col2X = 240; // পরিমাণ (Quantity - centered)
            const col3X = 370; // একক মূল্য (Unit Price - right aligned)
            const col4X = pdf.internal.pageSize.width - 55; // মোট মূল্য (Total Price - right aligned)
            const colWidths = [
                180, // পণ্য - Increased width
                80,  // পরিমাণ
                100, // একক মূল্য
                100  // মোট মূল্য
            ];

            pdf.text('পণ্য', col1X, y + (headerHeight / 2) + 4); // +4 for vertical centering approximation
            pdf.text('পরিমাণ', col2X + (colWidths[1] / 2), y + (headerHeight / 2) + 4, { align: 'center' });
            pdf.text('একক মূল্য', col3X + colWidths[2], y + (headerHeight / 2) + 4, { align: 'right' });
            pdf.text('মোট মূল্য', col4X, y + (headerHeight / 2) + 4, { align: 'right' });
            y += headerHeight;

            // Table Rows
            pdf.setFontSize(11);
            cart.forEach(item => {
                const itemTotal = item.quantity * item.price;
                
                // Use splitTextToSize for product name to handle long names
                // Adjusted width for splitTextToSize
                const productNameLines = pdf.splitTextToSize(item.name, colWidths[0] - 5); 
                let rowHeight = productNameLines.length * (pdf.getFontSize() * lineHeightFactor);
                if (rowHeight < 20) rowHeight = 20; // Minimum row height

                // Draw border for row
                pdf.rect(50, y, tableWidth, rowHeight); 

                pdf.text(productNameLines, col1X, y + 14); // Always start text from the top of the cell
                pdf.text(`${item.quantity} ${item.unit}`, col2X + (colWidths[1] / 2), y + 14, { align: 'center' });
                pdf.text(`${item.price} টাকা`, col3X + colWidths[2], y + 14, { align: 'right' });
                pdf.text(`${itemTotal} টাকা`, col4X, y + 14, { align: 'right' });
                y += rowHeight;

                // Check if current position is too low for the next item, if so, add new page
                // Allow more space for next content before adding a new page (e.g., 150pt bottom margin for footer/next section)
                if (y > pdf.internal.pageSize.height - 150 && cart.indexOf(item) < cart.length - 1) {
                    pdf.addPage();
                    y = 50; // Reset Y position for new page
                    // Redraw header on new page
                    pdf.setFontSize(12);
                    pdf.setFillColor(242, 242, 242);
                    pdf.rect(50, y, tableWidth, headerHeight, 'F');
                    pdf.setTextColor(0, 0, 0);
                    pdf.text('পণ্য', col1X, y + (headerHeight / 2) + 4);
                    pdf.text('পরিমাণ', col2X + (colWidths[1] / 2), y + (headerHeight / 2) + 4, { align: 'center' });
                    pdf.text('একক মূল্য', col3X + colWidths[2], y + (headerHeight / 2) + 4, { align: 'right' });
                    pdf.text('মোট মূল্য', col4X, y + (headerHeight / 2) + 4, { align: 'right' });
                    y += headerHeight;
                    pdf.setFontSize(11); // Reset font size for content
                }
            });

            y += (20 * lineHeightFactor); // Space after table

            // Total Bill
            pdf.setFontSize(16);
            pdf.text('মোট বিল:', pdf.internal.pageSize.width - 180, y, { align: 'right' });
            pdf.setFontSize(20);
            pdf.text(`${parseFloat(totalBillSpan.textContent)} টাকা`, pdf.internal.pageSize.width - 55, y + 5, { align: 'right' });
            y += (30 * lineHeightFactor);

            // Customer Information
            pdf.setFontSize(12);
            pdf.text('গ্রাহকের নাম: ' + document.getElementById('customer-name').value, 50, y);
            y += (15 * lineHeightFactor);
            pdf.text('মোবাইল নম্বর: ' + document.getElementById('customer-phone').value, 50, y);
            y += (15 * lineHeightFactor);
            
            // Split long address into multiple lines with a defined width
            const customerAddressText = 'ঠিকানা: ' + document.getElementById('customer-address').value;
            const addressTextWidth = pdf.internal.pageSize.width - 100; // Total available width - left and right margins
            const addressLines = pdf.splitTextToSize(customerAddressText, addressTextWidth);
            
            pdf.text(addressLines, 50, y);
            y += addressLines.length * (pdf.getFontSize() * lineHeightFactor); // Adjust y based on number of lines
            y += (20 * lineHeightFactor);

            // Thank You Message
            pdf.setFontSize(10);
            pdf.text('খুলনা মাছ ঘরের সাথে থাকার জন্য ধন্যবাদ!', pdf.internal.pageSize.width / 2, y, { align: 'center' });
            y += (12 * lineHeightFactor);
            pdf.text('আপনার বিশ্বাসই আমাদের প্রেরণা।', pdf.internal.pageSize.width / 2, y, { align: 'center' });

            pdf.save(`চালান_${currentOrderCode}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            // More specific error message for direct PDF generation issues
            showMessage('পিডিএফ তৈরি করতে সমস্যা', 'রসিদের পিডিএফ তৈরি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন। ত্রুটি: ' + error.message);
        }
    }

    downloadPdfBtn.addEventListener('click', generateInvoicePdf);

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
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                totalItemPrice: item.quantity * item.price
            })),
            totalBill: parseFloat(totalBillSpan.textContent),
            orderDate: currentInvoiceDate,
            orderCode: currentOrderCode
        };

        try {
            const loadingMessageTitle = 'অর্ডার প্রক্রিয়া চলছে...';
            const loadingMessageText = 'আপনার অর্ডার জমা দেওয়া হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...';
            showMessage(loadingMessageTitle, loadingMessageText); 

            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { 
                method: 'POST',
                mode: 'no-cors', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData), 
            });

            console.log('Order data sent to Google Sheet (check your sheet)!');

            document.getElementById('message-box-overlay').style.display = 'none';
            orderSuccessPopup.style.display = 'flex'; 

            orderForm.reset();
            cart = [];
            updateCartDisplay();

        } catch (error) {
            console.error('Error sending order:', error);
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
