const orderEmailTemplate = (order, title = 'Order Summary') => {
  // Format date
  const date = new Date(order.createdAt).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { padding: 40px 20px; text-align: center; background-color: #ffffff; border-bottom: 2px dashed #f0f0f0; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.5px; }
            .header p { margin: 10px 0 0; color: #666; font-size: 16px; }
            
            .content { padding: 30px; }
            .receipt-details { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; color: #666; background: #f9fafb; padding: 15px; border-radius: 6px; }
            .receipt-details div span { display: block; font-weight: 600; color: #333; margin-bottom: 4px; }

            .order-item { display: flex; align-items: center; padding: 20px 0; border-bottom: 1px solid #f0f0f0; }
            .item-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; background-color: #f0f0f0; margin-right: 20px; }
            .item-info { flex: 1; }
            .item-name { margin: 0 0 5px; font-size: 16px; font-weight: 600; color: #333; }
            .item-meta { margin: 0; color: #888; font-size: 14px; }
            .item-price { font-weight: 700; color: #333; font-size: 16px; }

            .totals { margin-top: 20px; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; color: #666; }
            .total-row.final { border-top: 2px solid #333; padding-top: 20px; margin-top: 20px; font-size: 20px; font-weight: 800; color: #1a1a1a; align-items: center; }

            .addresses-section { margin-top: 40px; }
            .address-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #1a1a1a; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            .address-col p { margin: 0; font-size: 14px; color: #555; line-height: 1.6; }
            .address-col strong { color: #333; display: block; margin-bottom: 5px; }

            .btn-container { text-align: center; margin-top: 40px; }
            .btn { display: inline-block; background-color: #ff6b6b; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); }
            
            .footer { text-align: center; padding: 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thank you for your purchase!</h1>
                <p>Your order will be processed within 24 hours.</p>
            </div>
            
            <div class="content">
                <div class="receipt-details">
                    <div><span>Date</span> ${date}</div>
                    <div>
                        <span>Order Number</span> 
                        ${(() => {
      const d = new Date(order.createdAt);
      const year = d.getFullYear();
      const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const hhmm = `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
      return `${year}-${mmdd}-${hhmm}`;
    })()}
                    </div>
                    <div><span>Payment Method</span> ${order.paymentMethod.toUpperCase()}</div>
                </div>

                <!-- Items -->
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.product.images && item.product.images[0] ? item.product.images[0] : 'https://placehold.co/100x100?text=No+Image'}" alt="${item.product.name}" class="item-img" />
                        <div class="item-info">
                            <h4 class="item-name">${item.product.name}</h4>
                            <p class="item-meta">Qty: ${item.quantity}</p>
                        </div>
                        <div class="item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}

                <!-- Totals -->
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal</span>
                        <span>₱${order.subtotal.toFixed(2)}</span>
                    </div>
                    <!-- Tax Removed -->
                    <div class="total-row">
                        <span>Shipping</span>
                        <span>₱${order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div class="total-row final">
                        <span>Order Total</span>
                        <span>₱${order.total.toFixed(2)}</span>
                    </div>
                </div>

                <!-- Addresses -->
                <div class="addresses-section">
                    <div class="address-grid">
                        <div class="address-col">
                            <div class="address-title">Billing Address</div> <!-- Using Billing for Customer Info as per request -->
                            <p>
                                <strong>${order.contactDetails.fullName}</strong>
                                ${order.contactDetails.phone}<br>
                                ${order.contactDetails.email}
                            </p>
                        </div>
                        <div class="address-col">
                            <div class="address-title">Shipping Address</div>
                            <p>
                                ${order.shippingAddress.street}<br>
                                ${order.shippingAddress.barangay}, ${order.shippingAddress.city}<br>
                                ${order.shippingAddress.region || ''} ${order.shippingAddress.zipCode}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="btn-container">
                    <a href="${process.env.CLIENT_URL}/orders" class="btn">Track Your Order</a>
                </div>
            </div>

            <div class="footer">
                <p>&copy; 2025 AmaraCé Skin Care. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = orderEmailTemplate;
