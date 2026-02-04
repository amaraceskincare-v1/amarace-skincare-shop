import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMinus, FiPlus, FiX } from 'react-icons/fi';
import '../styles/Checkout.css';

// Davao Del Norte data
const zipCodes = {
  "Panabo City": "8105", "Tagum City": "8100", "Island Garden City of Samal": "8119",
  "Carmen": "8101", "Sto. Tomas": "8112", "Kapalong": "8111", "Talaingod": "8117",
  "Asuncion": "8109", "Braulio E. Dujali": "8110", "San Isidro": "8114", "New Corella": "8108"
};

const barangayList = {
  "Panabo City": ["A. O. Floirendo", "Buenavista", "Cacao", "Cagangohan", "Consolacion", "Dapco", "Gredu (Pob.)", "J.P. Laurel", "Kasilak", "Katipunan", "Kauswagan", "Little Panay", "Mabunao", "Maduao", "Malativas", "Manay", "Nanyo", "New Malaga", "New Pandan (Pob.)", "Quezon", "San Francisco (Pob.)", "San Nicolas", "San Pedro", "Santa Cruz", "Santo Niño (Pob.)", "Sindaton", "Tagpore", "Tibungol"],
  "Tagum City": ["Apokon", "Bincungan", "Busaon", "Canocotan", "Cuambogan", "La Filipina", "Liboganon", "Madaum", "Magdum", "Magugpo East", "Magugpo North", "Magugpo Poblacion", "Magugpo South", "Magugpo West", "Mankilam", "New Balamban", "Nueva Fuerza", "Pagsabangan", "Pandapan", "San Agustin", "San Isidro", "Visayan Village"],
  "Island Garden City of Samal": ["Adecor", "Anonang", "Aumbay", "Babak (Pob.)", "Balet", "Cahayag", "Caliclic (Pob.)", "Camudmud", "Catagman", "Cogon", "Cogon (Pob.)", "Dadatan", "Del Monte", "Guilon", "Kanaan", "Kinawitnon", "Libertad", "Libuak", "Liling", "Limba", "Linabuan", "Mambago-A", "Mambago-B", "Miranda (Pob.)", "Moncado (Pob.)", "Pangubatan", "Poblacion (Kaputian)", "Quiola", "San Agustin (Pob.)", "San Antonio", "San Isidro (Babak)", "San Jose (Samal)", "San Miguel (Pob.)", "San Remigio", "Santa Cruz (Pob.)", " some others..."],
  "Carmen": ["Alejal", "Anibongan", "Asuncion", "Cebulano", "Guadalupe", "Ising (Poblacion)", "La Paz", "Mabaus", "Mabuhay", "Magsaysay", "Mangalcal", "Minda", "New Camiling", "Salvacion", "San Isidro", "Santo Niño", "Taba", "Tibulao", "Tubod", "Tuganay"],
  "Sto. Tomas": ["Balagunan", "Bobongon", "Esperanza", "Kimamon", "Kinamayan", "La Libertad", "Lunga-og", "Magwawa", "New Katipunan", "Pantaron", "Salvacion", "San Jose", "San Miguel", "San Vicente", "Talomo", "Tibal-og (Pob.)", "Tulalian", "New Visayas"],
  "Kapalong": ["Gupitan", "Mabantao", "Mamacao", "Pag-asa", "Semong", "Sua-on", "Tibungol", "Katipunan", "Maniki (Pob.)", "San Roque"],
  "Talaingod": ["Dagohoy", "Palma Gil", "Santo Niño"],
  "Asuncion": ["Binancian", "Buan", "Buclad", "Cabaywa", "Camanchiles", "Camansa", "Canatan", "Concepcion", "Doña Andrea", "Magatos", "Napungas", "New Bantayan", "New Santiago", "Pamimon", "Pob. (Cambanogoy)", "Sagayen", "San Vicente", "Santa Filomena", "Sonlon", "Tibungol"],
  "Braulio E. Dujali": ["Cabay-Angan", "Dujali", "Magupising", "New Casay", "Tanglaw"],
  "San Isidro": ["Dacudao", "Datu Balong", "Igangon", "Libuton", "Mamacao", "Pinamuno", "Sabangan", "San Miguel", "San Roque", "Sawata (Poblacion)", "Santo Niño"],
  "New Corella": ["Cabidianan", "Carcor", "Del Monte", "El Salvador", "Limba-an", "Lucob", "Macgum", "Mambing", "Mesaoy", "New Bohol", "New Sambog", "Patrocenio", "Poblacion", "San Roque", "Santa Cruz", "Santa Fe", "Santo Niño", "Suawon", "Ubayon"]
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Get items array safely
  const items = cart?.items || [];

  const [address, setAddress] = useState({
    street: '', city: '', barangay: '', zipCode: '', landmark: ''
  });

  const [contact, setContact] = useState({
    fullName: user?.name || '',
    phone: '',
    email: user?.email || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [requestChange, setRequestChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState('');

  const shipping = cartTotal >= 500 ? 0 : 85;
  const total = cartTotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.fullName || !contact.phone || !contact.email) {
      toast.error('Please fill in all contact details');
      return;
    }

    if (paymentMethod === 'gcash' && !proofImage) {
      toast.error('Please upload your GCash payment proof');
      return;
    }

    setLoading(true);
    try {
      let response;

      if (paymentMethod === 'gcash') {
        const formData = new FormData();
        formData.append('shippingAddress', JSON.stringify(address));
        formData.append('contactDetails', JSON.stringify(contact));
        formData.append('paymentMethod', 'gcash');
        formData.append('paymentProof', proofImage);
        formData.append('totalAmount', total);
        formData.append('shippingCost', shipping);

        response = await api.post('/orders/gcash', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // COD logic
        const codData = {
          shippingAddress: address,
          contactDetails: {
            ...contact,
            note: requestChange ? `Request for change from ₱${changeAmount}` : ''
          },
          paymentMethod: 'cod',
          shippingCost: shipping,
          totalAmount: total
        };

        response = await api.post('/orders/cod', codData);
      }

      await clearCart();
      toast.success(paymentMethod === 'cod' ? 'Order placed! Please prepare exact payment upon delivery.' : 'Order placed! We will confirm once payment is verified.');
      navigate(`/order-success/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <Link to="/products">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left - Form */}
        <div className="checkout-form-section">
          <Link to="/" className="checkout-logo">AmaraCé</Link>

          <nav className="checkout-breadcrumb">
            <Link to="/cart">Cart</Link> <span>›</span> <span className="active">Checkout</span>
          </nav>

          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Contact */}
            <section className="form-section">
              <h2>Contact</h2>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  required
                />
              </div>
            </section>

            {/* Delivery */}
            <section className="form-section">
              <h2>Delivery</h2>
              <div className="form-group">
                <input
                  placeholder="Full Name"
                  value={contact.fullName}
                  onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  placeholder="Phone Number"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  placeholder="Street Address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <select
                  value={address.city}
                  onChange={(e) => {
                    const city = e.target.value;
                    setAddress({ ...address, city, barangay: '', zipCode: zipCodes[city] || '' });
                  }}
                  required
                >
                  <option value="">City/Municipality</option>
                  {Object.keys(zipCodes).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <select
                  value={address.barangay}
                  onChange={(e) => setAddress({ ...address, barangay: e.target.value })}
                  required
                >
                  <option value="">Barangay</option>
                  {address.city && barangayList[address.city]?.map(brgy => (
                    <option key={brgy} value={brgy}>{brgy}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <input placeholder="ZIP Code" value={address.zipCode} readOnly />
                <input
                  placeholder="Landmark (Optional)"
                  value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                />
              </div>
            </section>

            {/* Payment Selection */}
            <section className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-options-v2">
                <div
                  className={`payment-card-v2 ${paymentMethod === 'gcash' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('gcash')}
                >
                  <div className="payment-card-v2-header">
                    <div className="payment-radio">
                      <div className="radio-circle"></div>
                    </div>
                    <span>GCash</span>
                    <img
                      src="/images/payment/gcash-logo.png"
                      alt="GCash"
                      className="payment-icon-mini"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://raw.githubusercontent.com/amaraceskincare-v1/amarace-skincare-shop/main/frontend/public/images/gcash-logo.png';
                      }}
                    />
                  </div>
                </div>

                <div
                  className={`payment-card-v2 ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="payment-card-v2-header">
                    <div className="payment-radio">
                      <div className="radio-circle"></div>
                    </div>
                    <span>Cash On Delivery (COD)</span>
                    <div className="payment-icon-mini cod-icon">🚚</div>
                  </div>
                </div>
              </div>

              {/* Conditional Payment Details */}
              <div className="payment-details-v2">
                {paymentMethod === 'gcash' ? (
                  <div className="payment-instruction-box gcash-box">
                    <p>Scan the QR code below and pay <strong>₱{total.toFixed(2)}</strong></p>
                    <div className="qr-container">
                      <img
                        src={settings?.gcashQRCode || "/gcash-qr.png"}
                        alt="GCash QR"
                        className="qr-code"
                      />
                    </div>
                    <p className="upload-label">Upload payment screenshot:</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofImage(e.target.files[0])}
                      required={paymentMethod === 'gcash'}
                    />
                    {proofImage && <p className="file-name">✓ {proofImage.name}</p>}
                  </div>
                ) : (
                  <div className="payment-instruction-box cod-box">
                    <div className="cod-info-header">
                      <span className="info-icon">ℹ️</span>
                      <h3>Pay with cash upon delivery</h3>
                    </div>
                    <p className="cod-total-highlight">Order Total: ₱{total.toFixed(2)}</p>

                    <div className="cod-instructions">
                      <ul>
                        <li>Please prepare the exact amount</li>
                        <li>Payment will be collected by our delivery rider</li>
                        <li>Make sure someone is available to receive the order</li>
                      </ul>
                    </div>

                    <div className="cod-change-request">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={requestChange}
                          onChange={(e) => setRequestChange(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Request for change?
                      </label>

                      {requestChange && (
                        <div className="change-amount-input">
                          <span>Amount tendered:</span>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={changeAmount}
                            onChange={(e) => setChangeAmount(e.target.value)}
                            required={requestChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <button type="submit" className="pay-btn" disabled={loading}>
              {loading ? 'Processing...' : (
                paymentMethod === 'gcash'
                  ? `Pay ₱${total.toFixed(2)}`
                  : `Place Order - COD ₱${total.toFixed(2)}`
              )}
            </button>
          </form>

          <div className="checkout-policies">
            <Link to="/policies/shipping-returns">Refund Policy</Link>
            <Link to="/policies/privacy">Privacy Policy</Link>
            <Link to="/policies/terms">Terms of Service</Link>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="checkout-summary-section">
          <div className="order-items">
            {items.map((item) => (
              <div key={item.product?._id || item.productId} className="summary-item-modern">
                <div className="item-image">
                  <img src={item.product?.images?.[0] || '/placeholder.jpg'} alt={item.product?.name} />
                </div>

                <div className="item-details">
                  <h4 className="item-name">{item.product?.name}</h4>
                  <p className="item-price">₱{item.product?.price?.toFixed(2)}</p>

                  <div className="item-controls">
                    <div className="qty-controls">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.product?._id)}
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₱${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="accepted-payment-methods">
            <p className="payment-methods-title">We Accept:</p>
            <div className="payment-icons-row">
              <div className="payment-method-icon-card">
                <img
                  src="/images/payment/gcash-logo.png"
                  alt="GCash"
                  className="payment-method-icon"
                  title="GCash"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://raw.githubusercontent.com/amaraceskincare-v1/amarace-skincare-shop/main/frontend/public/images/gcash-logo.png';
                  }}
                />
              </div>
              <div className="payment-method-icon-card">
                <img
                  src="/images/payment/cod-icon.png"
                  alt="Cash on Delivery"
                  className="payment-method-icon"
                  title="Cash on Delivery"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/2311/2311531.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
