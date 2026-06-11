import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  Boxes,
  Database,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

function App() {
  const [health, setHealth] = useState(null);
  const [ready, setReady] = useState(null);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    product_id: "",
    quantity: "",
  });

  const loadDashboard = async () => {
    setLoading(true);
    setMessage("");

    try {
      const [healthRes, readyRes, summaryRes, productsRes, ordersRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/health`),
          axios.get(`${API_BASE_URL}/ready`),
          axios.get(`${API_BASE_URL}/analytics/summary`),
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/orders`),
        ]);

      setHealth(healthRes.data);
      setReady(readyRes.data);
      setSummary(summaryRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      setMessage("Failed to load dashboard data. Check backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const createProduct = async (event) => {
    event.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/products`, {
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      });

      setProductForm({
        name: "",
        category: "",
        price: "",
        stock: "",
      });

      setMessage("Product created successfully.");
      loadDashboard();
    } catch (error) {
      setMessage("Failed to create product.");
    }
  };

  const createOrder = async (event) => {
    event.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/orders`, {
        customer_name: orderForm.customer_name,
        product_id: Number(orderForm.product_id),
        quantity: Number(orderForm.quantity),
      });

      setOrderForm({
        customer_name: "",
        product_id: "",
        quantity: "",
      });

      setMessage("Order placed successfully.");
      loadDashboard();
    } catch (error) {
      setMessage("Failed to place order. Check stock or product ID.");
    }
  };

  const money = (value) => {
    return `$${Number(value || 0).toLocaleString()}`;
  };

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="tag">AWS EKS Production Portfolio Project</p>
          <h1>CloudCart Platform</h1>
          <p className="hero-text">
            A production-style 3-tier application built for Docker, Kubernetes,
            AWS EKS, PostgreSQL, CI/CD, and cloud observability.
          </p>

          <button onClick={loadDashboard} disabled={loading}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Refresh Dashboard
          </button>
        </div>

        <div className="status-card">
          <h2>
            <Activity size={22} />
            Runtime Status
          </h2>

          <div className="status-row">
            <span>API Health</span>
            <strong className="green">{health?.status || "unknown"}</strong>
          </div>

          <div className="status-row">
            <span>Database</span>
            <strong className="green">{ready?.database || "unknown"}</strong>
          </div>

          <div className="status-row">
            <span>Service</span>
            <strong>{health?.service || "cloudcart-api"}</strong>
          </div>
        </div>
      </section>

      {message && <div className="message">{message}</div>}

      <section className="metrics">
        <MetricCard
          icon={<Boxes />}
          title="Products"
          value={summary?.total_products || 0}
          subtitle="Inventory items"
        />

        <MetricCard
          icon={<ShoppingCart />}
          title="Orders"
          value={summary?.total_orders || 0}
          subtitle="Customer orders"
        />

        <MetricCard
          icon={<TrendingUp />}
          title="Revenue"
          value={money(summary?.total_revenue)}
          subtitle="Total order value"
        />

        <MetricCard
          icon={<Database />}
          title="Inventory Value"
          value={money(summary?.inventory_value)}
          subtitle={`${summary?.total_stock || 0} units in stock`}
        />
      </section>

      {summary?.low_stock_count > 0 && (
        <section className="warning">
          <AlertTriangle size={22} />
          <div>
            <strong>Low Stock Alert</strong>
            <p>
              {summary.low_stock_count} product(s) are below the stock
              threshold. Later we can connect this to Prometheus and Alertmanager.
            </p>
          </div>
        </section>
      )}

      <section className="forms">
        <div className="panel">
          <h2>
            <PackagePlus size={22} />
            Add Product
          </h2>

          <form onSubmit={createProduct}>
            <input
              placeholder="Product name"
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
              required
            />

            <input
              placeholder="Category"
              value={productForm.category}
              onChange={(e) =>
                setProductForm({ ...productForm, category: e.target.value })
              }
              required
            />

            <input
              placeholder="Price"
              type="number"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({ ...productForm, price: e.target.value })
              }
              required
            />

            <input
              placeholder="Stock"
              type="number"
              value={productForm.stock}
              onChange={(e) =>
                setProductForm({ ...productForm, stock: e.target.value })
              }
              required
            />

            <button type="submit">Create Product</button>
          </form>
        </div>

        <div className="panel">
          <h2>
            <ShoppingCart size={22} />
            Place Order
          </h2>

          <form onSubmit={createOrder}>
            <input
              placeholder="Customer name"
              value={orderForm.customer_name}
              onChange={(e) =>
                setOrderForm({ ...orderForm, customer_name: e.target.value })
              }
              required
            />

            <select
              value={orderForm.product_id}
              onChange={(e) =>
                setOrderForm({ ...orderForm, product_id: e.target.value })
              }
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  #{product.id} - {product.name} ({product.stock} left)
                </option>
              ))}
            </select>

            <input
              placeholder="Quantity"
              type="number"
              value={orderForm.quantity}
              onChange={(e) =>
                setOrderForm({ ...orderForm, quantity: e.target.value })
              }
              required
            />

            <button type="submit">Place Order</button>
          </form>
        </div>
      </section>

      <section className="tables">
        <Table
          title="Inventory"
          columns={["ID", "Name", "Category", "Price", "Stock"]}
          rows={products.map((product) => [
            product.id,
            product.name,
            product.category,
            money(product.price),
            product.stock,
          ])}
        />

        <Table
          title="Orders"
          columns={["ID", "Customer", "Product", "Quantity", "Status"]}
          rows={orders.map((order) => [
            order.id,
            order.customer_name,
            order.product_name,
            order.quantity,
            order.status,
          ])}
        />
      </section>
    </main>
  );
}

function MetricCard({ icon, title, value, subtitle }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{subtitle}</span>
    </div>
  );
}

function Table({ title, columns, rows }) {
  return (
    <div className="panel table-panel">
      <h2>{title}</h2>

      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>No data available</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;