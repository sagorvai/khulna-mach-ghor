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
    // Reference the order summary as a page
    const orderSummaryPage = document.getElementById('order-summary-modal'); // Renamed to clarify it's a page, but kept original ID
    const closeOrderSummaryBtn = document.getElementById('close-order-summary-btn'); 

    const invoiceDateSpan = document.getElementById('invoice-date');
    const invoiceOrderCodeSpan = document.getElementById('invoice-order-code');

    const orderSuccessPopup = document.getElementById('order-success-popup');
    const closeSuccessPopupBtn = document.getElementById('close-success-popup-btn');
    const closeSuccessPopupBtnBottom = document.getElementById('close-success-popup-btn-bottom');
    const downloadPdfBtn = document.getElementById('download-pdf-btn'); 
    const whatsappShareBtn = document.getElementById('whatsapp-share-btn'); 

    const floatingCartButton = document.getElementById('floating-cart-button');
    const cartItemCountSpan = document.getElementById('cart-item-count');

    let cart = [];
    let selectedProduct = null;

    let currentOrderCode = '';
    let currentInvoiceDate = ''; 

    // IMPORTANT: This is your provided Google Apps Script Web App URL
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzF744HikAy54VZdx19EnTwkutLmS_SfvnjTMUBwt3I21LpOS14ALF0KS9WM70cIf1D/exec"; 

    const dynamicCategoryGrids = new Map();

    // Function to convert Bengali numbers to English numbers
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

    async function loadProductsFromSheet() {
        console.log('Attempting to load products from Google Apps Script...');
        console.log('Using URL:', GOOGLE_APPS_SCRIPT_URL);
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
            console.log('Fetch response received:', response);

            if (!response.ok) {
                console.error('HTTP error! Status:', response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const productsData = await response.json();
            console.log('Products data received:', productsData);
            
            // Check for error property in the response from Apps Script
            if (productsData.error) {
                showMessage('পণ্য লোড করতে সমস্যা', 'Apps Script থেকে পণ্য ডেটা লোড করা যায়নি: ' + productsData.error + ' অনুগ্রহ করে Apps Script লগ চেক করুন।');
                console.error('Apps Script Error in response:', productsData.error);
                return;
            }
            
            if (productsData.length === 0) {
                showMessage('পণ্য নেই', 'Apps Script থেকে কোনো পণ্য পাওয়া যায়নি। অনুগ্রহ করে আপনার প্রোডাক্ট শিট চেক করুন।');
                console.warn('No products data found in the response.');
            } else {
                renderProducts(productsData); 
                console.log('Products rendered successfully.');
            }

        } catch (error) {
            console.error('Error loading products from sheet:', error);
            showMessage('পণ্য লোড করতে সমস্যা', 'পণ্য তালিকা লোড করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ বা Apps Script Deployment চেক করুন। বিস্তারিত ত্রুটি: ' + error.message);
        }
    }

    function renderProducts(productsToRender) {
        productsSectionContainer.innerHTML = ''; // Clear existing products
        dynamicCategoryGrids.clear();

        if (!productsToRender || productsToRender.length === 0) {
            console.warn('renderProducts called with no data.');
            productsSectionContainer.innerHTML = `<p style="text-align: center; color: #555; font-size: 1.1rem;">কোনো মাছের তথ্য লোড করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন বা অ্যাডমিনের সাথে যোগাযোগ করুন।</p>`;
            return;
        }

        productsToRender.forEach(product => {
            // Validate essential data points for a product
            if (!product.Name_BN || product.Name_BN.toString().trim() === '' ||
                !product.Price || product.Price.toString().trim() === '' ||
                !product.Category || product.Category.toString().trim() === '') {
                console.warn('Skipping invalid product row (missing essential data):', product);
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

        if (productsSectionContainer.children.length === 0) {
            productsSectionContainer.innerHTML = `<p style="text-align: center; color: #555; font-size: 1.1rem;">কোনো উপযুক্ত মাছের তথ্য পাওয়া যায়নি। আপনার শীটে সঠিক ডেটা আছে কিনা নিশ্চিত করুন।</p>`;
        }
    }

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let totalItemCount = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            totalItemCount++; // Summing up quantities for total count (might not be accurate for "items in cart" count)
            
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

        if (cart.length > 0) { // Check cart array length for distinct items
            floatingCartButton.style.display = 'flex';
            cartItemCountSpan.textContent = cart.length; // Show number of distinct items
        } else {
            floatingCartButton.style.display = 'none';
            cartItemCountSpan.textContent = 0;
        }

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
        return `KMG-${year}${month}${day}-${uniqueId}`; // KMG for Khulna Mach Ghar
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
            popupQuantityInput.min = '0.1'; 
            popupQuantityInput.step = '0.1'; 
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

    // MODIFIED: Floating Cart Button click to open Order Summary PAGE
    floatingCartButton.addEventListener('click', () => {
        if (cart.length > 0) {
            updateCartDisplay(); // Refresh display before showing
            document.body.classList.add('no-scroll'); // Prevent main page scroll
            orderSummaryPage.style.display = 'flex'; // Show the full-page order summary
        }
    });

    // MODIFIED: Close Order Summary PAGE
    closeOrderSummaryBtn.addEventListener('click', () => {
        orderSummaryPage.style.display = 'none';
        document.body.classList.remove('no-scroll'); // Re-enable main page scroll
    });

    // UPDATED: PDF Generation Function
    async function generateInvoicePdf(customerData, orderDetails) {
        try {
            const pdf = new window.jspdf.jsPDF('portrait', 'pt', 'a4');
            
            pdf.setFont('helvetica', 'normal'); 
            
            let y = 50; 
            const lineHeightFactor = 1.2; 
            const leftMargin = 50;
            const rightMargin = pdf.internal.pageSize.width - 50; 

            const tableWidth = pdf.internal.pageSize.width - (2 * leftMargin);
            const colWidthsArray = [
                tableWidth * 0.40, // Item (40%)
                tableWidth * 0.20, // Quantity (20%)
                tableWidth * 0.15, // Unit Price (15%)
                tableWidth * 0.25  // Total Price (25%)
            ];

            const col1X = leftMargin + 5; 
            const col2X = leftMargin + colWidthsArray[0] + (colWidthsArray[1] / 2); 
            const col3X = leftMargin + colWidthsArray[0] + colWidthsArray[1] + colWidthsArray[2]; 
            const col4X = rightMargin - 5; 

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
            
            // Convert Bengali date to English for PDF
            const pdfDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            pdf.text(`Date: ${pdfDate}`, leftMargin, y); 
            y += (15 * lineHeightFactor);
            pdf.text(`Order Code: ${orderDetails.orderCode}`, leftMargin, y);
            y += (30 * lineHeightFactor);

            // Table Header
            pdf.setFontSize(12);
            pdf.setFillColor(242, 242, 242); 
            const headerHeight = 20;
            pdf.rect(leftMargin, y, tableWidth, headerHeight, 'F'); 
            pdf.setTextColor(0, 0, 0);
            
            pdf.text('Item', col1X, y + (headerHeight / 2) + 4); 
            pdf.text('Quantity', col2X, y + (headerHeight / 2) + 4, { align: 'center' }); 
            pdf.text('Unit Price', col3X, y + (headerHeight / 2) + 4, { align: 'right' }); 
            pdf.text('Total Price', col4X, y + (headerHeight / 2) + 4, { align: 'right' }); 
            y += headerHeight;

            // Table Rows
            pdf.setFontSize(11);
            orderDetails.items.forEach(item => { 
                const itemTotal = item.quantity * item.price;
                
                const itemNameForPdf = item.nameEn && item.nameEn.trim() !== '' ? item.nameEn : item.name;
                
                // Use simple text for item name to keep it on one line.
                const maxItemNameWidth = colWidthsArray[0] - 10; 
                
                const textLineHeight = pdf.getFontSize() * lineHeightFactor;
                let rowHeight = textLineHeight; // Default row height for single line item
                if (rowHeight < 20) rowHeight = 20; // Minimum row height to ensure spacing

                pdf.rect(leftMargin, y, tableWidth, rowHeight, 'S'); 

                // Use simple text for item name with maxWidth option
                pdf.text(itemNameForPdf, col1X, y + (textLineHeight * 0.75), { maxWidth: maxItemNameWidth }); 
                pdf.text(`${item.quantity} ${item.unit === 'কেজি' ? 'KG' : item.unit}`, col2X, y + (textLineHeight * 0.75), { align: 'center' });
                pdf.text(`${item.price} BDT`, col3X, y + (textLineHeight * 0.75), { align: 'right' });
                pdf.text(`${itemTotal} BDT`, col4X, y + (textLineHeight * 0.75), { align: 'right' });
                
                y += rowHeight;

                // Page breaking logic
                if (y > pdf.internal.pageSize.height - 150 && orderDetails.items.indexOf(item) < orderDetails.items.length - 1) {
                    pdf.addPage();
                    y = 50; 
                    pdf.setFontSize(12);
                    pdf.setFillColor(242, 242, 242);
                    pdf.rect(leftMargin, y, tableWidth, headerHeight, 'F');
                    pdf.setTextColor(0, 0, 0);
                    pdf.text('Item', col1X, y + (headerHeight / 2) + 4);
                    pdf.text('Quantity', col2X, y + (headerHeight / 2) + 4, { align: 'center' });
                    pdf.text('Unit Price', col3X, y + (headerHeight / 2) + 4, { align: 'right' });
                    pdf.text('Total Price', col4X, y + (headerHeight / 2) + 4, { align: 'right' });
                    y += headerHeight;
                    pdf.setFontSize(11); 
                }
            });

            y += (20 * lineHeightFactor); 

            // Total Bill
            pdf.setFontSize(16);
            pdf.text('Total Bill:', rightMargin - 125, y, { align: 'right' }); 
            pdf.setFontSize(20);
            pdf.text(`${orderDetails.totalBill} BDT`, rightMargin, y + 5, { align: 'right' });
            y += (15 * lineHeightFactor); 

            // UPDATED: Delivery and Packing Charge Note alignment
            pdf.setFontSize(10); 
            pdf.text('(+) Delivery & Packing Charges Applicable', rightMargin, y, { align: 'right' });
            y += (30 * lineHeightFactor); 

            // Customer Information
            pdf.setFontSize(12);
            pdf.text('Customer Name: ' + customerData.customerName, leftMargin, y);
            y += (15 * lineHeightFactor);
            const englishMobileNo = convertBengaliNumbersToEnglish(customerData.customerPhone);
            pdf.text('Mobile No: ' + englishMobileNo, leftMargin, y);
            y += (15 * lineHeightFactor);
            
            const customerAddressText = 'Address: ' + customerData.customerAddress;
            const addressTextWidth = tableWidth; 
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

    downloadPdfBtn.addEventListener('click', () => {
        if (lastSubmittedOrderData) { 
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

    let lastSubmittedOrderData = null; 

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            showMessage('অর্ডার ত্রুটি', 'অর্ডার করার জন্য কোনো পণ্য নির্বাচন করা হয়নি।');
            return;
        }

        const customerName = document.getElementById('customer-name').value;
        let customerPhone = document.getElementById('customer-phone').value;
        const customerAddress = document.getElementById('customer-address').value;
        
        if (!customerName || !customerPhone || !customerAddress) {
            showMessage('তথ্য পূরণ করুন', 'দয়া করে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা পূরণ করুন।');
            return;
        }
        
        // Convert customer phone number to English numbers for Google Sheet and internal use
        customerPhone = convertBengaliNumbersToEnglish(customerPhone);

        const currentOrderData = {
            customerName: customerName,
            customerPhone: customerPhone, 
            customerAddress: customerAddress,
            items: cart.map(item => ({ 
                name: item.name,
                nameEn: item.nameEn, 
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                totalItemPrice: item.quantity * item.price
            })),
            totalBill: parseFloat(totalBillSpan.textContent),
            orderDate: currentInvoiceDate, 
            orderCode: currentOrderCode 
        };
        lastSubmittedOrderData = currentOrderData; 

        try {
            const loadingMessageTitle = 'অর্ডার প্রক্রিয়া চলছে...';
            const loadingMessageText = 'আপনার অর্ডার জমা দেওয়া হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...';
            showMessage(loadingMessageTitle, loadingMessageText); 

            orderSummaryPage.style.display = 'none'; 

            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { 
                method: 'POST',
                mode: 'no-cors', // This is crucial for cross-origin requests to Apps Script
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentOrderData), 
            });

            console.log('Order data sent to Google Sheet (check your sheet)!');

            document.getElementById('message-box-overlay').style.display = 'none';
            orderSuccessPopup.style.display = 'flex'; 

            if (whatsappShareBtn) { 
                const whatsappMessage = `প্রিয় খুলনা মাছ ঘর টিম, আমার অর্ডার কোড: ${currentOrderCode}%0Aআমার মোবাইল: ${customerPhone}%0A%0Aআমি আমার অর্ডারের বিবরণ শেয়ার করতে চাই।`;
                whatsappShareBtn.href = `https://wa.me/8801951912031?text=${encodeURIComponent(whatsappMessage)}`;
            }

            orderForm.reset();
            cart = [];
            updateCartDisplay(); 
            document.body.classList.remove('no-scroll'); 
            
        } catch (error) {
            console.error('Error sending order:', error);
            document.getElementById('message-box-overlay').style.display = 'none';
            showMessage('অর্ডার জমা দিতে সমস্যা', 'অর্ডার জমা দিতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।');
            document.body.classList.remove('no-scroll'); 
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


    // ADDED: Class to prevent body scrolling when a full-page overlay is active
    // This needs to be applied/removed to the body element in JS
    // Add `body.no-scroll { overflow: hidden; }` to CSS.
    const styleSheet = document.styleSheets[0];
    if (styleSheet) { // Check if stylesheet exists before inserting rule
        let ruleExists = false;
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].cssText.includes('body.no-scroll')) {
                ruleExists = true;
                break;
            }
        }
        if (!ruleExists) {
            styleSheet.insertRule('body.no-scroll { overflow: hidden !important; }', styleSheet.cssRules.length);
        }
    }


    // Initial setup
    updateCartDisplay();
    loadProductsFromSheet();
});
