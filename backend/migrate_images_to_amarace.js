/**
 * CLOUDINARY MIGRATION SCRIPT
 * Re-uploads all images from the old 'drpkxjhhi' Cloudinary account
 * to the new 'amarace' account, then updates the database URLs.
 *
 * Run with: node backend/migrate_images_to_amarace.js
 */
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const SiteSettings = require('./models/SiteSettings');
const Order = require('./models/Order');

dotenv.config({ path: path.join(__dirname, '.env') });

// Configure cloudinary with the NEW account credentials
cloudinary.config({
    cloud_name: 'amarace',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const OLD_CLOUD = 'drpkxjhhi';

/**
 * Re-uploads a single image URL from the old account to the new account.
 * Returns the new URL on the amarace account.
 */
const reuploadImage = async (oldUrl, folder = 'migrated-assets') => {
    if (!oldUrl || !oldUrl.includes(OLD_CLOUD)) return oldUrl; // skip if not from old account
    try {
        // Upload by URL - Cloudinary fetches it directly
        const result = await cloudinary.uploader.upload(oldUrl, {
            folder: folder,
            resource_type: 'auto',
            overwrite: false,
        });
        console.log(`  ✅ Uploaded: ${oldUrl.split('/').pop()} → ${result.secure_url}`);
        return result.secure_url;
    } catch (err) {
        console.error(`  ❌ Failed to upload ${oldUrl}: ${err.message}`);
        return oldUrl; // keep old URL if upload failed
    }
};

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected\n');

        // ─── 1. PRODUCTS ───────────────────────────────────────────────
        console.log('=== Migrating Products ===');
        const products = await Product.find({ images: { $regex: OLD_CLOUD } });
        console.log(`Found ${products.length} products with old cloud images.\n`);

        for (const product of products) {
            console.log(`📦 Product: ${product.name}`);
            const newImages = [];
            for (const imgUrl of product.images) {
                const newUrl = await reuploadImage(imgUrl, 'ecommerce-products');
                newImages.push(newUrl);
            }
            product.images = newImages;
            await product.save();
        }

        // ─── 2. SITE SETTINGS ──────────────────────────────────────────
        console.log('\n=== Migrating Site Settings ===');
        const settings = await SiteSettings.find({});

        for (const setting of settings) {
            let updated = false;

            const singleFields = [
                'logo', 'navbarLogo', 'sideAd', 'headerBackground',
                'gcashQRCode', 'footerSmallIcon', 'lipTintImage',
                'perfumeImage', 'beautySoapImage', 'allBestSellersImage',
                'ourStoryImage', 'productHeroMedia', 'premiumBannerMedia'
            ];

            for (const field of singleFields) {
                if (setting[field] && setting[field].includes(OLD_CLOUD)) {
                    console.log(`🖼  Setting: ${field}`);
                    setting[field] = await reuploadImage(setting[field], 'site-assets');
                    updated = true;
                }
            }

            const arrayFields = ['heroImages', 'teamImages', 'galleryImages'];
            for (const field of arrayFields) {
                if (setting[field] && setting[field].some(u => u.includes(OLD_CLOUD))) {
                    console.log(`🖼  Setting array: ${field} (${setting[field].length} items)`);
                    const newArr = [];
                    for (const imgUrl of setting[field]) {
                        newArr.push(await reuploadImage(imgUrl, 'site-assets'));
                    }
                    setting[field] = newArr;
                    updated = true;
                }
            }

            if (updated) {
                await setting.save();
                console.log('  ✅ Site settings updated');
            }
        }

        // ─── 3. ORDERS (payment & delivery proofs) ────────────────────
        console.log('\n=== Migrating Order Proofs ===');
        const orders = await Order.find({
            $or: [
                { paymentProof: { $regex: OLD_CLOUD } },
                { deliveryProof: { $regex: OLD_CLOUD } }
            ]
        });
        console.log(`Found ${orders.length} orders with old proof images.`);

        for (const order of orders) {
            if (order.paymentProof && order.paymentProof.includes(OLD_CLOUD)) {
                console.log(`🧾 Order ${order._id} - payment proof`);
                order.paymentProof = await reuploadImage(order.paymentProof, 'payment-proofs');
            }
            if (order.deliveryProof && order.deliveryProof.includes(OLD_CLOUD)) {
                console.log(`🧾 Order ${order._id} - delivery proof`);
                order.deliveryProof = await reuploadImage(order.deliveryProof, 'delivery-proofs');
            }
            await order.save();
        }

        console.log('\n\n🎉 MIGRATION COMPLETE!');
        console.log('All images have been moved to the amarace Cloudinary account.');
        console.log('Database URLs have been updated.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
