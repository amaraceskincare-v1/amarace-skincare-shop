import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
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
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proofImage, setProofImage] = useState(null);

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

  const shipping = cartTotal >= 500 ? 0 : 85;
  const total = cartTotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.fullName || !contact.phone || !contact.email) {
      toast.error('Please fill in all contact details');
      return;
    }
    if (!proofImage) {
      toast.error('Please upload your GCash payment proof');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('shippingAddress', JSON.stringify(address));
      formData.append('contactDetails', JSON.stringify(contact));
      formData.append('paymentMethod', 'gcash');
      formData.append('paymentProof', proofImage);
      formData.append('totalAmount', total);
      formData.append('shippingCost', shipping);

      const response = await api.post('/orders/gcash', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await clearCart();
      toast.success('Order placed! We will confirm once payment is verified.');
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

            {/* Payment - GCash Only */}
            <section className="form-section">
              <h2>Payment</h2>
              <div className="payment-method gcash">
                <div className="gcash-header">
                  <span className="gcash-badge">GCash</span>
                  <span>Pay via GCash QR Code</span>
                </div>
                <div className="gcash-body">
                  <p>Scan the QR code below and pay <strong>₱{total.toFixed(2)}</strong></p>
                  <div className="qr-container">
                    <img src="/gcash-qr.png" alt="GCash QR" className="qr-code" />
                  </div>



                  <p className="upload-label">Upload payment screenshot:</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofImage(e.target.files[0])}
                    required
                  />
                  {proofImage && <p className="file-name">✓ {proofImage.name}</p>}
                </div>
              </div>
            </section>

            <button type="submit" className="pay-btn" disabled={loading}>
              {loading ? 'Processing...' : `Pay ₱${total.toFixed(2)}`}
            </button>
          </form>

          {/* Policy Links */}
          <div className="checkout-policies">
            <Link to="/info/refund-policy">Refund Policy</Link>
            <Link to="/info/privacy-policy">Privacy Policy</Link>
            <Link to="/info/terms">Terms of Service</Link>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="checkout-summary-section">
          <div className="order-items">
            {items.map((item) => (
              <div key={item.product?._id || item.productId} className="summary-item">
                <div className="item-image">
                  <img src={item.product?.images?.[0] || '/placeholder.jpg'} alt={item.product?.name} />
                  <span className="item-qty">{item.quantity}</span>
                </div>
                <div className="item-info">
                  <h4>{item.product?.name}</h4>
                </div>
                <div className="item-price">₱{((item.product?.price || 0) * item.quantity).toFixed(2)}</div>
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
        </div>
      </div>
    </div>
  );
};

export default Checkout;
