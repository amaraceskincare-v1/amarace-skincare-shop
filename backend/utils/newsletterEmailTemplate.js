const welcomeNewsletter = () => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #4f46e5; text-align: center;">Welcome to AmaraCé Skin Care! ✨</h1>
      <p>Hi there,</p>
      <p>Thank you for subscribing to our newsletter! You're now on the list to receive:</p>
      <ul>
        <li>Exclusive offers & discounts</li>
        <li>New product announcements</li>
        <li>Skincare tips & tricks</li>
      </ul>
      <p>As a welcome gift, use code <strong>WELCOME10</strong> for 10% off your next order!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/products" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} AmaraCé Skin Care. All rights reserved.
      </p>
    </div>
  `;
};

const weeklyNewsletter = (products) => {
    const productList = products.map(p => `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
      <h3 style="margin: 0;">${p.name}</h3>
      <p style="color: #666;">${p.description.substring(0, 100)}...</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/products/${p._id}" style="color: #4f46e5;">View Product</a>
    </div>
  `).join('');

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #4f46e5; text-align: center;">Weekly Highlights 🌟</h1>
      <p>Here are this week's top picks just for you:</p>
      ${productList}
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/products" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop All</a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #888;">
        To unsubscribe, simply reply 'STOP'.
        <br>© ${new Date().getFullYear()} AmaraCé Skin Care.
      </p>
    </div>
  `;
};

module.exports = { welcomeNewsletter, weeklyNewsletter };
