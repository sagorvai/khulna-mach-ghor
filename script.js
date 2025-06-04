/*
* Sutoni MJ ফন্ট ব্যবহারের জন্য নির্দেশিকা:
* যদি আপনার কাছে Sutoni MJ ফন্টের ফাইল (.ttf, .woff, .woff2 ইত্যাদি) থাকে,
* তাহলে সেগুলোকে আপনার ওয়েবসাইটের একটি ফোল্ডারে (যেমন 'fonts/') রাখুন
* এবং নিচের @font-face রুলটি ব্যবহার করে ইম্পোর্ট করুন:
*/
/*
@font-face {
    font-family: 'Sutoni MJ';
    src: url('fonts/SutoniMJ.eot');
    src: url('fonts/SutoniMJ.eot?#iefix') format('embedded-opentype'),
         url('fonts/SutoniMJ.woff2') format('woff2'),
         url('fonts/SutoniMJ.woff') format('woff'),
         url('fonts/SutoniMJ.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}
*/

/* General Styles */
body {
    font-family: 'Sutoni MJ', 'Baloo Da 2', Arial, sans-serif; /* Bengali font with fallback */
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: #333;
    line-height: 1.6;
    background-color: #f8f8f8; /* Light background */
    /* গ্রামীণ দৃশ্য এবং সুন্দরবন ব্যাকগ্রাউন্ড */
    background-image: url('https://placehold.co/1920x1080/E0F2F7/0056b3?text=গ্রামীন+মাছ+ধরা+ও+সুন্দরবন+দৃশ্য'); /* প্রাকৃতিক দৃশ্যের প্লেসহোল্ডার */
    background-size: cover;
    background-attachment: fixed; /* স্ক্রল করলেও ব্যাকগ্রাউন্ড স্থির থাকবে */
    background-position: center center;
    position: relative; /* overlay এর জন্য */
    z-index: 0;
}

body::before { /* ব্যাকগ্রাউন্ড ইমেজকে হালকা আবছা করার জন্য ওভারলে */
    content: '';
    position: fixed; /* Fix it to the viewport */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7); /* হালকা সাদা ওভারলে */
    backdrop-filter: blur(2px); /* হালকা ব্লার */
    z-index: -1; /* মূল কন্টেন্টের নিচে থাকবে */
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

h1, h2, h3, h4 {
    font-family: 'Sutoni MJ', 'Baloo Da 2', Arial, sans-serif;
    font-weight: 700;
}

p {
    font-family: 'Roboto', Arial, sans-serif; /* A more readable font for paragraphs */
}
/* বাংলা ফন্ট সেট করুন, যেহেতু Sutoni MJ একটি নির্দিষ্ট ফন্ট, এটি সরাসরি Google Fonts এ নেই।
   Baloo Da 2 একটি ভালো বিকল্প যা Google Fonts এ আছে।
   যদি আপনি Sutoni MJ ব্যবহার করতে চান, আপনাকে ফন্ট ফাইল হোস্টিং এবং @font-face রুল ব্যবহার করতে হবে। */
.main-header, .hero-section, .why-us-section, .process-section,
.products-section, .order-summary-section, .order-popup-content,
.contact-section, footer, #message-box-content {
    font-family: 'Sutoni MJ', 'Baloo Da 2', Arial, sans-serif;
}


/* Header */
.main-header {
    background-color: #0056b3; /* Deep blue */
    color: white;
    padding: 10px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.main-header .container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.logo-placeholder {
    margin-bottom: 5px;
}

/* Updated: Logo Image Styling */
.company-logo {
    max-width: 180px; /* লোগোর আকার নিয়ন্ত্রণ */
    height: auto;
    margin-bottom: 5px;
    display: block; /* Ensure it behaves as a block element for margin auto */
    margin-left: auto;
    margin-right: auto;
}

.company-name {
    display: none; /* Hide the H1 as logo image is used */
}

.slogan {
    font-size: 1.2em;
    font-style: italic;
    margin-top: 5px;
    margin-bottom: 15px;
}

.main-header nav {
    display: flex;
    flex-wrap: wrap; /* Allow navigation items to wrap on smaller screens */
    justify-content: center;
}

.main-header nav a {
    color: white;
    text-decoration: none;
    margin: 0 15px;
    font-weight: 600;
    transition: color 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 5px; /* Space between icon and text */
    padding: 5px 0; /* Add some vertical padding for touch targets */
}

.main-header nav a:hover {
    color: #ffd700; /* Gold on hover */
}

/* Hero Section */
.hero-section {
    /* Updated: Background image added, gradient as overlay */
    background: linear-gradient(to right, rgba(0, 86, 179, 0.85), rgba(0, 123, 255, 0.65)), url('https://placehold.co/1920x600/0056b3/FFFFFF?text=নদী+ও+মাছ') center center / cover no-repeat;
    color: white;
    padding: 80px 0;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 350px; /* উচ্চতা কমানো হয়েছে */
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    margin-bottom: 40px; /* সেকশনের নিচে মার্জিন */
}

.hero-section .container {
    display: flex;
    align-items: center;
    justify-content: center; /* মাঝখানে আনার জন্য */
    flex-direction: column; /* কন্টেন্ট কলামে সাজানো */
}

.hero-content {
    flex: 1;
    min-width: 300px;
    text-align: center; /* হিরো কন্টেন্ট মাঝখানে */
    margin-right: 0; /* মার্জিন সরানো হয়েছে */
}

.hero-content h2 {
    font-size: 2.5em;
    margin-bottom: 15px;
}

.hero-content p {
    font-size: 1.1em;
    margin-bottom: 30px;
}

.hero-buttons {
    display: flex;
    flex-wrap: wrap; /* Allow buttons to wrap */
    justify-content: center;
    gap: 15px; /* Space between buttons */
}

.hero-buttons .btn {
    display: inline-flex; /* Align icon and text */
    align-items: center;
    gap: 8px; /* Space between icon and text */
    padding: 12px 25px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease;
    min-width: 200px; /* Ensure buttons are a decent size */
    justify-content: center; /* Center content within button */
}

.btn.primary-btn {
    background-color: #28a745; /* Green */
    color: white;
}

.btn.primary-btn:hover {
    background-color: #218838;
    transform: translateY(-2px);
}

.btn.whatsapp-btn {
    background-color: #25D366; /* WhatsApp green */
    color: white;
}

.btn.whatsapp-btn:hover {
    background-color: #1DA851;
    transform: translateY(-2px);
}

/* Why Us Section & Process Section */
.why-us-section, .process-section, .products-section, .contact-section, footer {
    background-color: rgba(255, 255, 255, 0.9); /* হালকা ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড */
    border-radius: 10px;
    margin: 20px auto; /* চারপাশে মার্জিন */
    padding: 40px 20px; /* প্যাডিং কমানো হয়েছে */
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    backdrop-filter: blur(3px); /* হালকা ব্লার ইফেক্ট */
}

.why-us-section h2, .process-section h2, .products-section h2, .contact-section h2 {
    font-size: 2.5em;
    color: #0056b3;
    margin-bottom: 40px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-align: center; /* Center align headings */
    width: 100%; /* Ensure heading takes full width for centering */
    justify-content: center;
}

.why-us-section .features-grid, .process-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-top: 30px;
}

.feature-item, .step-item {
    background-color: #f0f8ff; /* Light blue */
    border: 1px solid #cce5ff;
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    text-align: center; /* Center content in feature/step items */
}

.feature-item:hover, .step-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.12);
}

.feature-icon, .process-icon {
    font-size: 3em;
    color: #e67e22; /* Orange */
    margin-bottom: 15px;
}

.feature-item h3, .step-item h4 {
    font-size: 1.8em;
    color: #333;
    margin-bottom: 10px;
}

/* Products Section */
.products-section {
    padding: 60px 0;
}

.products-section h2 {
    text-align: center;
    font-size: 2.5em;
    color: #0056b3;
    margin-bottom: 15px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.section-description {
    text-align: center;
    font-size: 1.1em;
    margin-bottom: 40px;
    color: #555;
}

/* New: Styles for dynamically added product categories */
.product-category {
    margin-bottom: 50px;
}

.product-category h3 {
    text-align: center;
    font-size: 2.2em;
    color: #e67e22; /* Orange for categories */
    margin-bottom: 30px;
    border-bottom: 2px solid #e67e22;
    display: inline-block;
    padding-bottom: 5px;
    width: 100%; /* Make it span full width */
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
}

/* Product Item Clickable */
.product-item {
    background-color: #ffffff;
    border: 3px solid #ffcc00; /* Yellow border from image */
    border-radius: 10px;
    padding: 0; /* No padding directly on item */
    text-align: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Ensures image corners are rounded correctly */
    cursor: pointer; /* Indicate it's clickable */
    position: relative; /* For absolute positioning of overlay */
    min-height: 350px; /* Ensure enough height for image and overlay */
}

.product-item.unavailable {
    opacity: 0.6; /* Dim unavailable items */
    cursor: not-allowed;
    border-color: #dc3545; /* Red border for unavailable */
}

.product-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}
.product-item.unavailable:hover {
    transform: none; /* No hover effect for unavailable */
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}


.product-item img {
    width: 100%;
    height: 100%; /* Image fills the entire product-item */
    object-fit: cover;
    border-radius: 0;
    display: block;
    position: absolute; /* Position image behind overlay */
    top: 0;
    left: 0;
    z-index: 1;
}

/* Updated: Bottom section containing text and button */
.product-item .product-bottom-section {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2; /* Above the image */
    display: flex;
    flex-direction: column; /* Stack text then button */
    align-items: center;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%); /* Subtle dark gradient for text readability */
    padding-top: 50px; /* Gives space for gradient to fade in */
    box-sizing: border-box;
}

/* Updated: Inline display for Name and Price (no background) */
.product-item .product-info-inline {
    display: flex;
    justify-content: center; /* Center items horizontally */
    align-items: baseline; /* Align text along their baselines */
    width: 100%; /* Take full width of parent */
    padding: 0 15px 10px; /* Padding for text, bottom padding to separate from button */
    color: white; /* White text */
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8); /* Text shadow for readability */
    background: transparent; /* No background */
    box-sizing: border-box;
}

.product-item h4 {
    font-size: 1.6em;
    margin: 0; /* Remove default margin */
    white-space: nowrap; /* Keep text on single line */
}

.product-item .price {
    font-size: 1.3em;
    color: white; /* Ensure price is white */
    font-weight: bold;
    margin: 0 0 0 10px; /* Left margin for spacing from name */
    white-space: nowrap; /* Keep text on single line */
}

.product-item .open-order-form-btn {
    background-color: #0056b3; /* Solid blue for the button */
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 0 0 7px 7px; /* Rounded bottom corners */
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    transition: background-color 0.3s ease;
    width: 100%; /* Full width */
    box-sizing: border-box; /* Include padding in width */
    margin-top: 0; /* No top margin from previous element if it's the last element in flex column */
}

.product-item .open-order-form-btn:hover {
    background-color: #004085;
}

.product-item .open-order-form-btn.unavailable-btn {
    background-color: #dc3545; /* Red for unavailable button */
    cursor: not-allowed;
}
.product-item .open-order-form-btn.unavailable-btn:hover {
    background-color: #dc3545; /* No hover effect for unavailable */
    transform: none;
}


/* Order Summary Section (Updated to match image) */
.order-summary-section {
    background-color: #ffffff; /* White background */
    border: 1px solid #ddd; /* Light border */
    border-radius: 10px;
    padding: 30px;
    margin-top: 60px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    color: #333;
    font-family: 'Sutoni MJ', 'Baloo Da 2', Arial, sans-serif; /* Bengali font */
}

.order-summary-heading {
    text-align: left; /* Align to left as in image */
    font-size: 2.2em;
    color: #0056b3;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
    font-weight: 700;
}

/* Invoice Details */
.invoice-details {
    background-color: #e9f5ff;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #cce5ff;
}

.invoice-details p {
    margin: 5px 0;
    font-size: 1.1em;
    color: #333;
}
.invoice-details p strong {
    color: #0056b3;
}

#cart-items {
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px dashed #bbb;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 1.2em;
    font-weight: bold;
    color: #000;
}

.cart-item .item-details {
    flex-grow: 1;
    text-align: left;
}

.cart-item .item-total {
    white-space: nowrap;
    min-width: 80px;
    text-align: right;
}

.cart-item .remove-item-btn {
    background-color: transparent;
    color: #dc3545;
    border: none;
    padding: 5px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1em;
    transition: color 0.3s ease;
    margin-left: 10px;
}

.cart-item .remove-item-btn:hover {
    color: #c82333;
}

.cart-total-section {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    padding-top: 15px;
    border-top: 2px solid #000;
    margin-bottom: 20px;
}

.cart-total-section .total-label {
    font-size: 1.8em;
    font-weight: bold;
    color: #000;
    margin-right: 10px;
    margin-bottom: 0;
}

.cart-total-section .total-amount {
    font-size: 2.2em;
    font-weight: bold;
    color: #000;
    margin-bottom: 0;
}

#order-form {
    margin-top: 30px;
    padding: 0;
    box-shadow: none;
}

.customer-info-heading {
    text-align: left;
    font-size: 1.5em;
    color: #000;
    margin-bottom: 5px;
    margin-top: 20px;
    font-weight: bold;
}
.customer-info-heading:first-of-type {
    margin-top: 0;
}

#order-form input[type="text"],
#order-form input[type="tel"],
#order-form textarea {
    width: calc(100% - 24px);
    padding: 10px;
    margin-bottom: 15px;
    border: 2px solid #000;
    border-radius: 5px;
    font-size: 1.2em;
    box-sizing: border-box;
}

#order-form textarea {
    min-height: 80px;
    resize: vertical;
}

.order-confirm-btn {
    width: 100%;
    background-color: #0056b3;
    color: white;
    padding: 15px;
    font-size: 1.5em;
    font-weight: bold;
    border-radius: 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.3s ease;
}

.order-confirm-btn:hover {
    background-color: #004085;
}

/* Order Popup Specific Styles */
.order-popup-overlay {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-out;
}

.order-popup-content {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 600px;
    text-align: center;
    position: relative;
    animation: slideInTop 0.3s ease-out;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.order-popup-content .close-popup-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5em;
    color: #666;
    cursor: pointer;
    transition: color 0.3s ease;
}
.order-popup-content .close-popup-btn:hover {
    color: #333;
}

.order-popup-content .popup-product-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    width: 100%;
}

.order-popup-content .popup-product-details img {
    max-width: 250px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.order-popup-content .text-details {
    text-align: center;
}

.order-popup-content h3 {
    font-size: 2em;
    color: #0056b3;
    margin-bottom: 5px;
    font-weight: 700;
}

.order-popup-content h3 span {
    font-size: 0.8em;
    color: #555;
}

.order-popup-content .popup-product-description {
    font-size: 1.1em;
    color: #666;
    margin-bottom: 15px;
}

.order-popup-content .popup-price-display {
    font-size: 1.4em;
    color: #555;
    margin-bottom: 20px;
    font-weight: bold;
}

.order-popup-content .order-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin-bottom: 25px;
}

.order-popup-content .order-controls label {
    font-weight: bold;
    font-size: 1.2em;
}

.order-popup-content .order-controls input {
    width: 80px;
    padding: 10px;
    border: 2px solid #0056b3;
    border-radius: 5px;
    text-align: center;
    font-size: 1.1em;
    -moz-appearance: textfield;
}
/* Hide arrows for Chrome, Safari, Edge */
.order-popup-content .order-controls input::-webkit-outer-spin-button,
.order-popup-content .order-controls input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.order-popup-content .btn {
    width: calc(100% - 20px);
    padding: 12px 20px;
    font-size: 1.2em;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.order-popup-content .btn.primary-btn {
    background-color: #28a745;
    color: white;
}
.order-popup-content .btn.primary-btn:hover {
    background-color: #218838;
    transform: translateY(-1px);
}

/* Order Success Popup Styles */
.order-popup-content.success-content {
    max-width: 500px;
    padding: 40px;
    background: linear-gradient(135deg, #e6ffe6, #ccebcc);
    border: 2px solid #28a745;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}

.success-heading {
    font-size: 2.5em;
    color: #28a745;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.success-heading .fas {
    font-size: 1em;
}

.success-message {
    font-size: 1.3em;
    color: #333;
    margin-bottom: 10px;
    line-height: 1.4;
}

.thank-you-message {
    font-size: 1.5em;
    font-weight: bold;
    color: #0056b3;
    margin-top: 20px;
}

.order-popup-content.success-content .btn {
    margin-top: 30px;
    width: auto;
    padding: 12px 40px;
}

/* Custom Message Box Styles */
#message-box-overlay {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: none;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-out;
}

#message-box-content {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    width: 90%;
    max-width: 400px;
    text-align: center;
    position: relative;
    animation: slideInTop 0.3s ease-out;
}

#message-box-content h4 {
    font-size: 1.8em;
    color: #e67e22;
    margin-bottom: 15px;
}

#message-box-content p {
    font-size: 1.1em;
    color: #333;
    margin-bottom: 25px;
}

#message-box-content button {
    background-color: #0056b3;
    color: white;
    border: none;
    padding: 10px 25px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

#message-box-content button:hover {
    background-color: #004085;
}

/* Responsive Design */
@media (min-width: 768px) {
    /* পপ-আপের লেআউট বড় স্ক্রিনের জন্য */
    .order-popup-content .popup-product-details {
        flex-direction: row;
        text-align: left;
    }
    .order-popup-content .text-details {
        text-align: left;
    }
    .order-popup-content .popup-product-details img {
        flex-shrink: 0;
    }
}

@media (max-width: 768px) {
    .main-header nav a {
        margin: 0 8px;
        font-size: 0.9em;
    }
    .hero-section .container {
        flex-direction: column;
    }
    .hero-content {
        margin-right: 0;
        margin-bottom: 30px;
        text-align: center;
    }
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    .hero-buttons .btn {
        margin: 10px 0;
        width: 80%;
    }

    .why-us-section .features-grid, .process-steps {
        grid-template-columns: 1fr;
    }

    .product-grid {
        grid-template-columns: 1fr;
    }

    .product-item {
        padding: 0;
        min-height: 300px;
    }

    .product-item .open-order-form-btn {
        font-size: 1em;
    }

    /* Popup on smaller screens */
    .order-popup-content {
        width: 95%;
        margin: 5% auto;
    }
    .order-popup-content .btn {
        width: 100%;
        margin: 5px 0;
    }

    .cart-item {
        font-size: 1.1em;
    }
    .cart-total-section .total-label,
    .cart-total-section .total-amount {
        font-size: 1.5em;
    }
    .customer-info-heading {
        font-size: 1.3em;
    }
    #order-form input, #order-form textarea {
        font-size: 1.1em;
    }
    .order-confirm-btn {
        font-size: 1.3em;
    }

    .success-heading {
        font-size: 1.8em;
    }
    .success-message {
        font-size: 1.1em;
    }
}
