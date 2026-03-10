const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Error: Cloudinary credentials not found in .env file');
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const filesToUpload = [
    { name: 'logo', path: '../frontend/public/logo.png' },
    { name: 'gcash_qr', path: '../frontend/public/gcash-qr.png' },
    { name: 'favicon_16', path: '../frontend/public/favicon-16x16.png' },
    { name: 'favicon_32', path: '../frontend/public/favicon-32x32.png' },
    { name: 'og_image', path: '../frontend/public/og-image.jpg' },
    { name: 'cod_icon', path: '../frontend/public/images/payment/cod-icon.png' },
    { name: 'gcash_logo', path: '../frontend/public/images/payment/gcash-logo.png' },
    { name: 'lip_tint_bg', path: '../frontend/src/assets/backgrounds/lip_tint.png' },
    { name: 'perfume_bg', path: '../frontend/src/assets/backgrounds/perfume.png' },
    { name: 'soap_bg', path: '../frontend/src/assets/backgrounds/soap.png' },
];

const uploadFiles = async () => {
    console.log('Starting Cloudinary Migration...');
    const results = {};

    for (const file of filesToUpload) {
        const absolutePath = path.join(__dirname, file.path);
        if (fs.existsSync(absolutePath)) {
            try {
                console.log(`Uploading ${file.name} from ${absolutePath}...`);
                const result = await cloudinary.uploader.upload(absolutePath, {
                    folder: 'site-assets',
                    public_id: file.name,
                    overwrite: true,
                    resource_type: 'auto'
                });
                results[file.name] = result.secure_url;
                console.log(`✅ Uploaded ${file.name}: ${result.secure_url}`);
            } catch (error) {
                console.error(`❌ Failed to upload ${file.name}:`, error);
            }
        } else {
            console.warn(`⚠️ File not found: ${absolutePath}`);
        }
    }

    console.log('\n--- MIGRATION SUMMARY ---');
    console.log(JSON.stringify(results, null, 2));

    // Save results to a JSON file for easy reference
    fs.writeFileSync(path.join(__dirname, 'cloudinary_assets.json'), JSON.stringify(results, null, 2));
    console.log('\nResults saved to backend/cloudinary_assets.json');
};

uploadFiles();
