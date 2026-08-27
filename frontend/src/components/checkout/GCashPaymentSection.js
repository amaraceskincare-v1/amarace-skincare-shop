import React, { useState } from 'react';
import { FiCopy, FiCheck, FiMaximize2, FiX, FiDownload, FiInfo, FiSmartphone, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { optimizeImage } from '../../utils/imageOptimizer';
import ReceiptUploader from './ReceiptUploader';

const GCashPaymentSection = ({
    total,
    settings,
    proofImage,
    setProofImage
}) => {
    const [copiedNumber, setCopiedNumber] = useState(false);
    const [copiedName, setCopiedName] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    const accountName = settings?.gcashAccountName || 'AmaraCé Skincare';
    const accountNumber = settings?.gcashAccountNumber || '0917 123 4567';
    const qrImage = settings?.gcashQRCode || '/gcash-qr.png';

    const handleCopyNumber = () => {
        // Strip non-digits for cleaner paste if needed, or keep formatted
        const cleanNumber = accountNumber.replace(/[^\d+]/g, '');
        navigator.clipboard.writeText(cleanNumber || accountNumber);
        setCopiedNumber(true);
        toast.success('GCash mobile number copied to clipboard! 📋');
        setTimeout(() => setCopiedNumber(false), 2500);
    };

    const handleCopyName = () => {
        navigator.clipboard.writeText(accountName);
        setCopiedName(true);
        toast.success('Account name copied! 📋');
        setTimeout(() => setCopiedName(false), 2500);
    };

    return (
        <div className="gcash-premium-section">
            {/* Amount to Pay Banner */}
            <div className="gcash-amount-banner">
                <div className="amount-label-group">
                    <span className="amount-subtitle">EXACT AMOUNT TO PAY</span>
                    <div className="amount-value">₱{total.toFixed(2)}</div>
                </div>
                <div className="amount-pill">
                    <span>Includes shipping &amp; discounts</span>
                </div>
            </div>

            {/* Account Information Card */}
            <div className="gcash-account-card">
                <div className="account-card-header">
                    <div className="gcash-logo-badge">
                        <img
                            src="https://res.cloudinary.com/amarace/image/upload/v1/site-assets/gcash_logo.png"
                            alt="GCash"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/payment/gcash-logo.png';
                            }}
                        />
                    </div>
                    <div className="account-tagline">
                        <strong>Official AmaraCé GCash Account</strong>
                        <small>Direct Merchant Payment</small>
                    </div>
                </div>

                <div className="account-details-grid">
                    {/* Account Name */}
                    <div className="account-field">
                        <span className="field-label">Account Name</span>
                        <div className="field-value-row">
                            <span className="field-text">{accountName}</span>
                            <button
                                type="button"
                                className="btn-copy"
                                onClick={handleCopyName}
                                title="Copy Account Name"
                            >
                                {copiedName ? <FiCheck color="#16A34A" /> : <FiCopy />}
                                <span>{copiedName ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="account-field">
                        <span className="field-label">GCash Mobile Number</span>
                        <div className="field-value-row">
                            <span className="field-text number-highlight">{accountNumber}</span>
                            <button
                                type="button"
                                className="btn-copy primary"
                                onClick={handleCopyNumber}
                                title="Copy GCash Number"
                            >
                                {copiedNumber ? <FiCheck color="#16A34A" /> : <FiCopy />}
                                <span>{copiedNumber ? 'Copied' : 'Copy Number'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Presentation Card */}
            <div className="gcash-qr-card">
                <div className="qr-header">
                    <span className="qr-title">Scan QR Code via GCash</span>
                    <span className="qr-hint">Tap code to enlarge</span>
                </div>

                <div
                    className="qr-frame-wrapper"
                    onClick={() => setShowQrModal(true)}
                    role="button"
                    tabIndex={0}
                    title="Click to zoom QR code"
                >
                    <img
                        src={optimizeImage(qrImage, 360)}
                        alt="AmaraCé GCash QR Code"
                        className="gcash-qr-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/gcash-qr.png';
                        }}
                    />
                    <div className="qr-hover-overlay">
                        <FiMaximize2 size={24} />
                        <span>Enlarge QR</span>
                    </div>
                </div>
            </div>

            {/* 3-Step Payment Guide */}
            <div className="gcash-steps-guide">
                <div className="guide-title">How to Pay in 3 Simple Steps</div>
                <div className="guide-steps-grid">
                    <div className="guide-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <strong>Scan or Copy</strong>
                            <p>Scan the QR code above or copy the GCash mobile number.</p>
                        </div>
                    </div>

                    <div className="guide-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <strong>Send Exact ₱{total.toFixed(2)}</strong>
                            <p>Enter the exact amount in your GCash app and complete payment.</p>
                        </div>
                    </div>

                    <div className="guide-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <strong>Upload Receipt</strong>
                            <p>Take a screenshot of your payment receipt and attach it below.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Proof Uploader */}
            <div className="receipt-section-wrapper">
                <div className="receipt-section-header">
                    <h4>Attach GCash Payment Proof</h4>
                    <span className="required-tag">Required</span>
                </div>
                <ReceiptUploader
                    proofImage={proofImage}
                    setProofImage={setProofImage}
                />
            </div>

            {/* QR Modal View */}
            {showQrModal && (
                <div className="gcash-qr-modal-overlay" onClick={() => setShowQrModal(false)}>
                    <div className="gcash-qr-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="qr-modal-close-btn"
                            onClick={() => setShowQrModal(false)}
                        >
                            <FiX size={20} />
                        </button>
                        <h3>Scan AmaraCé GCash QR Code</h3>
                        <p>Pay exactly <strong>₱{total.toFixed(2)}</strong> to <strong>{accountName}</strong></p>

                        <div className="qr-modal-image-box">
                            <img
                                src={qrImage}
                                alt="AmaraCé GCash QR Code Full"
                                className="qr-modal-full-img"
                            />
                        </div>

                        <div className="qr-modal-actions">
                            <a
                                href={qrImage}
                                download="AmaraCe_GCash_QR.png"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="qr-download-link"
                            >
                                <FiDownload /> Download QR Code
                            </a>
                            <button
                                type="button"
                                onClick={handleCopyNumber}
                                className="qr-copy-action-btn"
                            >
                                {copiedNumber ? <FiCheck /> : <FiCopy />} Copy Number ({accountNumber})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GCashPaymentSection;
