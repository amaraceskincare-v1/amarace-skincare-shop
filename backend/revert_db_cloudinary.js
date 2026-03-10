/**
 * EMERGENCY REVERT SCRIPT
 * Reverts Cloudinary URLs from 'amarace' back to 'drpkxjhhi' in the database.
 * Run this to restore images immediately while the proper migration is set up.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const SiteSettings = require('./models/SiteSettings');
const Order = require('./models/Order');

dotenv.config({ path: path.join(__dirname, '.env') });

const OLD_CLOUD = 'amarace';
const NEW_CLOUD = 'drpkxjhhi';

const revert = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Revert Products
        console.log('Reverting Products...');
        const products = await Product.find({ images: { $regex: OLD_CLOUD } });
        console.log(`Found ${products.length} products to revert.`);

        for (const product of products) {
            product.images = product.images.map(img => img.replace(new RegExp(OLD_CLOUD, 'g'), NEW_CLOUD));
            await product.save();
            console.log(`✅ Reverted product: ${product.name}`);
        }

        // 2. Revert Site Settings
        console.log('Reverting Site Settings...');
        const settings = await SiteSettings.find({});
        for (const setting of settings) {
            let updated = false;
            const fields = [
                'logo', 'navbarLogo', 'sideAd', 'headerBackground',
                'gcashQRCode', 'footerSmallIcon', 'lipTintImage',
                'perfumeImage', 'beautySoapImage', 'allBestSellersImage',
                'ourStoryImage', 'productHeroMedia', 'premiumBannerMedia'
            ];

            fields.forEach(field => {
                if (setting[field] && typeof setting[field] === 'string' && setting[field].includes(OLD_CLOUD)) {
                    setting[field] = setting[field].replace(new RegExp(OLD_CLOUD, 'g'), NEW_CLOUD);
                    updated = true;
                }
            });

            if (setting.heroImages && setting.heroImages.length > 0) {
                const orig = JSON.stringify(setting.heroImages);
                setting.heroImages = setting.heroImages.map(img => img.replace(new RegExp(OLD_CLOUD, 'g'), NEW_CLOUD));
                if (orig !== JSON.stringify(setting.heroImages)) updated = true;
            }
            if (setting.teamImages && setting.teamImages.length > 0) {
                const orig = JSON.stringify(setting.teamImages);
                setting.teamImages = setting.teamImages.map(img => img.replace(new RegExp(OLD_CLOUD, 'g'), NEW_CLOUD));
                if (orig !== JSON.stringify(setting.teamImages)) updated = true;
            }
            if (setting.galleryImages && setting.galleryImages.length > 0) {
                const orig = JSON.stringify(setting.galleryImages);
                setting.galleryImages = setting.galleryImages.map(img => img.replace(new RegExp(OLD_CLOUD, 'g'), NEW_CLOUD));
                if (orig !== JSON.stringify(setting.galleryImages)) updated = true;
            }

            if (updated) {
                await setting.save();
                console.log('✅ Reverted Site Settings');
            }
        }

        // 3. Revert Orders
        console.log('Reverting Orders...');
        const orders = await Order.find({
            $or: [
                { paymentProof: { $regex: OLD_CLOUD } },
                { deliveryProof: { $regex: OLD_CLOUD } }
            ]
        });
        for (const order of orders) {
            if (order.paymentProof) order.paymentProof = order.paymentProof.replace(new RegExp(OLD_CLOUD, 'g'), NEW_CLOUD);
            if (order.deliveryProof) order.deliveryProof = order.deliveryProof.replace(new RegExp(OLD_CLOUD, 'g'), NEW_CLOUD);
            await order.save();
            console.log(`✅ Reverted order: ${order._id}`);
        }

        console.log('\n--- REVERT COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Revert failed:', error);
        process.exit(1);
    }
};

revert();
