require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
// Don't log full secret for security, just first/last chars
const secret = process.env.CLOUDINARY_API_SECRET || '';
console.log('API Secret:', secret.length > 5 ? `${secret.substring(0, 3)}...${secret.slice(-3)}` : 'INVALID');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('❌ Cloudinary Connection Failed:', error);
    } else {
        console.log('✅ Cloudinary Connection Successful:', result);
    }
});
