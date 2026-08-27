import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiCheckCircle, FiTrash2, FiRefreshCw, FiImage, FiAlertCircle, FiCamera } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const ReceiptUploader = ({ proofImage, setProofImage }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFile = (file) => {
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
            toast.error('Please upload a valid image (PNG, JPG, JPEG, or WEBP).');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('Receipt image exceeds 10MB limit. Please upload a smaller file.');
            return;
        }

        setProofImage(file);

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setProofImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="receipt-uploader-container">
            <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp, image/jpg"
                onChange={(e) => handleFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="receipt-file-input"
            />

            {!proofImage ? (
                /* Empty / Upload Dropzone State */
                <div
                    className={`receipt-dropzone ${isDragging ? 'dragging' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                    <div className="dropzone-icon-circle">
                        <FiUploadCloud className="dropzone-icon" />
                    </div>
                    <div className="dropzone-text">
                        <span className="dropzone-title">Upload GCash Screenshot or Photo</span>
                        <span className="dropzone-subtitle">
                            Tap to browse from photo gallery or use camera <FiCamera style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                        </span>
                        <span className="dropzone-hint">Supports JPG, PNG, WEBP up to 10MB</span>
                    </div>
                </div>
            ) : (
                /* Attached Receipt State with Luxury Preview */
                <div className="receipt-preview-card">
                    <div className="receipt-preview-thumb">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Receipt preview" />
                        ) : (
                            <FiImage size={28} color="#999" />
                        )}
                    </div>

                    <div className="receipt-preview-details">
                        <div className="receipt-status-badge">
                            <FiCheckCircle /> Receipt Attached
                        </div>
                        <div className="receipt-filename" title={proofImage.name}>
                            {proofImage.name}
                        </div>
                        <div className="receipt-filesize">
                            {formatFileSize(proofImage.size)} • Ready for submission
                        </div>
                    </div>

                    <div className="receipt-preview-actions">
                        <button
                            type="button"
                            className="btn-replace-receipt"
                            onClick={() => fileInputRef.current?.click()}
                            title="Replace image"
                        >
                            <FiRefreshCw /> Replace
                        </button>
                        <button
                            type="button"
                            className="btn-remove-receipt"
                            onClick={handleRemove}
                            title="Remove image"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceiptUploader;
