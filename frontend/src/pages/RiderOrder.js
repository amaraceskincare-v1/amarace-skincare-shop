import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiCamera, FiCheckCircle, FiPackage, FiMapPin, FiUser, FiPhone, FiImage } from 'react-icons/fi';
import './RiderOrder.css'; // We will create this

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RiderOrder = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/orders/rider/${id}`);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load order details');
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('deliveryProof', file);

        try {
            const { data } = await axios.put(`${API_URL}/orders/rider/${id}/delivery-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Refresh the order to show completed status
            setOrder({ ...order, status: 'delivered', deliveryProof: data.deliveryProof });
            alert('Delivery Proof Uploaded Successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // clear input
        }
    };

    if (loading) return <div className="rider-loading">Loading Order Details...</div>;
    if (error) return <div className="rider-error"><h3>Error</h3><p>{error}</p></div>;
    if (!order) return <div className="rider-error">Order not found</div>;

    const isDelivered = order.status === 'delivered';

    return (
        <div className="rider-container">
            <header className="rider-header">
                <h1>AmaraCé Delivery</h1>
                <span className={`status-badge ${order.status}`}>{order.status}</span>
            </header>

            <main className="rider-main">
                <section className="rider-card customer-info">
                    <h2><FiUser /> Customer Details</h2>
                    <p className="customer-name">{order.contactDetails?.fullName}</p>
                    <a href={`tel:${order.contactDetails?.phone}`} className="phone-link">
                        <FiPhone /> {order.contactDetails?.phone}
                    </a>
                </section>

                <section className="rider-card address-info">
                    <h2><FiMapPin /> Delivery Address</h2>
                    <p>{order.shippingAddress?.street}</p>
                    <p>{order.shippingAddress?.barangay}, {order.shippingAddress?.city}</p>
                    {order.shippingAddress?.landmark && <p className="landmark">Landmark: {order.shippingAddress.landmark}</p>}
                </section>

                <section className="rider-card payment-info">
                    <h2>Payment Action</h2>
                    {order.paymentMethod === 'cod' ? (
                        <div className="collect-cash">
                            <span>COLLECT CASH:</span>
                            <strong className="amount">₱{order.total?.toFixed(2)}</strong>
                        </div>
                    ) : (
                        <div className="paid-online">
                            <span>PAID VIA GCASH</span>
                            <strong className="amount">₱{order.total?.toFixed(2)}</strong>
                        </div>
                    )}
                </section>

                <section className="rider-card items-info">
                    <h2><FiPackage /> Items to Deliver</h2>
                    <ul className="rider-item-list">
                        {order.items?.map((item, idx) => (
                            <li key={idx} className="rider-item">
                                <img
                                    src={item.image || '/placeholder.jpg'}
                                    alt={item.name}
                                    className="rider-item-img"
                                />
                                <div className="rider-item-details">
                                    <span className="qty">x{item.quantity}</span>
                                    <span className="name">{item.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rider-action-area">
                    {isDelivered ? (
                        <div className="delivery-success">
                            <FiCheckCircle className="success-icon" />
                            <h3>Delivery Completed!</h3>
                            {order.deliveryProof && (
                                <img src={order.deliveryProof} alt="Delivery Proof" className="proof-img" />
                            )}
                        </div>
                    ) : (
                        <div className="upload-section">
                            <h3>Proof of Delivery</h3>
                            <p>Take a photo of the package at the location or with the customer to complete the delivery.</p>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                                id="camera-upload"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                                id="gallery-upload"
                            />
                            <div className="upload-options">
                                <label htmlFor="camera-upload" className={`upload-btn ${uploading ? 'uploading' : ''}`}>
                                    <FiCamera /> {uploading ? 'Uploading...' : 'Open Camera'}
                                </label>
                                <label htmlFor="gallery-upload" className={`upload-btn outline-btn ${uploading ? 'uploading' : ''}`}>
                                    <FiImage /> {uploading ? 'Wait...' : 'Gallery / Media'}
                                </label>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default RiderOrder;
