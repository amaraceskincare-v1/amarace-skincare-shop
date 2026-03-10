const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const SiteSettings = require('./models/SiteSettings');
const Order = require('./models/Order');

dotenv.config({ path: path.join(__dirname, '.env') });

const OLD_CLOUD = 'drpkxjhhi';
const NEW_CLOUD = 'amarace';

const migrate = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Migrate Products
        console.log('Checking Products...');
        const products = await Product.find({ images: { $regex: OLD_CLOUD } });
        console.log(`Found ${products.length} products to update.`);

        for (const product of products) {
            product.images = product.images.map(img => img.replace(OLD_CLOUD, NEW_CLOUD));
            await product.save();
            console.log(`✅ Updated product: ${product.name}`);
        }

        // 2. Migrate Site Settings
        console.log('Checking Site Settings...');
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
                    setting[field] = setting[field].replace(OLD_CLOUD, NEW_CLOUD);
                    updated = true;
                }
            });

            if (setting.heroImages && setting.heroImages.length > 0) {
                const originalHero = JSON.stringify(setting.heroImages);
                setting.heroImages = setting.heroImages.map(img => img.replace(OLD_CLOUD, NEW_CLOUD));
                if (originalHero !== JSON.stringify(setting.heroImages)) updated = true;
            }

            if (setting.teamImages && setting.teamImages.length > 0) {
                const originalTeam = JSON.stringify(setting.teamImages);
                setting.teamImages = setting.teamImages.map(img => img.replace(OLD_CLOUD, NEW_CLOUD));
                if (originalTeam !== JSON.stringify(setting.teamImages)) updated = true;
            }

            if (setting.galleryImages && setting.galleryImages.length > 0) {
                const originalGallery = JSON.stringify(setting.galleryImages);
                setting.galleryImages = setting.galleryImages.map(img => img.replace(OLD_CLOUD, NEW_CLOUD));
                if (originalGallery !== JSON.stringify(setting.galleryImages)) updated = true;
            }

            if (updated) {
                await setting.save();
                console.log('✅ Updated Site Settings');
            }
        }

        // 3. Migrate Orders (Payment proofs)
        console.log('Checking Orders...');
        const orders = await Order.find({
            $or: [
                { paymentProof: { $regex: OLD_CLOUD } },
                { deliveryProof: { $regex: OLD_CLOUD } }
            ]
        });
        console.log(`Found ${orders.length} orders to update.`);

        for (const order of orders) {
            if (order.paymentProof) order.paymentProof = order.paymentProof.replace(OLD_CLOUD, NEW_CLOUD);
            if (order.deliveryProof) order.deliveryProof = order.deliveryProof.replace(OLD_CLOUD, NEW_CLOUD);
            await order.save();
            console.log(`✅ Updated order: ${order._id}`);
        }

        console.log('\n--- MIGRATION COMPLETED ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
