import time
from flask import Blueprint, jsonify, request, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from sqlalchemy import text
from app.extensions import db
from app.models import Product, Order
from app.metrics import REQUEST_COUNT, REQUEST_LATENCY

api = Blueprint("api", __name__)


@api.before_request
def start_timer():
    request.start_time = time.time()


@api.after_request
def record_metrics(response):
    latency = time.time() - request.start_time
    endpoint = request.path

    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=endpoint,
    ).observe(latency)

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=endpoint,
        status_code=response.status_code,
    ).inc()

    return response


@api.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "cloudcart-api"
    }), 200


@api.route("/ready", methods=["GET"])
def ready():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({
            "status": "ready",
            "database": "connected"
        }), 200
    except Exception as error:
        return jsonify({
            "status": "not_ready",
            "database": "disconnected",
            "error": str(error)
        }), 503


@api.route("/metrics", methods=["GET"])
def metrics():
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)


@api.route("/products", methods=["GET"])
def list_products():
    products = Product.query.order_by(Product.id.desc()).all()
    return jsonify([product.to_dict() for product in products]), 200


@api.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()

    required_fields = ["name", "category", "price", "stock"]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({
            "error": "missing_required_fields",
            "fields": missing_fields
        }), 400

    product = Product(
        name=data["name"],
        category=data["category"],
        price=float(data["price"]),
        stock=int(data["stock"]),
    )

    db.session.add(product)
    db.session.commit()

    return jsonify(product.to_dict()), 201

@api.route("/analytics/summary", methods=["GET"])
def analytics_summary():
    products = Product.query.all()
    orders = Order.query.all()

    total_products = len(products)
    total_orders = len(orders)
    total_stock = sum(product.stock for product in products)
    inventory_value = sum(product.price * product.stock for product in products)

    total_revenue = 0
    status_counts = {}

    for order in orders:
        if order.product:
            total_revenue += order.product.price * order.quantity

        status_counts[order.status] = status_counts.get(order.status, 0) + 1

    low_stock_products = [
        product.to_dict()
        for product in products
        if product.stock <= 5
    ]

    return jsonify({
        "total_products": total_products,
        "total_orders": total_orders,
        "total_stock": total_stock,
        "inventory_value": round(inventory_value, 2),
        "total_revenue": round(total_revenue, 2),
        "low_stock_count": len(low_stock_products),
        "low_stock_products": low_stock_products,
        "order_status_counts": status_counts
    }), 200

@api.route("/orders", methods=["GET"])
def list_orders():
    orders = Order.query.order_by(Order.id.desc()).all()
    return jsonify([order.to_dict() for order in orders]), 200

@api.route("/stress", methods=["GET"])
def stress_test():
    start_time = time.time()
    count = 0

    while time.time() - start_time < 0.25:
        for number in range(1, 5000):
            count += number * number

    return jsonify({
        "status": "stress_completed",
        "duration_seconds": 0.25,
        "result": count
    }), 200

@api.route("/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    required_fields = ["customer_name", "product_id", "quantity"]
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({
            "error": "missing_required_fields",
            "fields": missing_fields
        }), 400

    product = Product.query.get(data["product_id"])

    if not product:
        return jsonify({"error": "product_not_found"}), 404

    quantity = int(data["quantity"])

    if product.stock < quantity:
        return jsonify({
            "error": "insufficient_stock",
            "available_stock": product.stock
        }), 409

    product.stock -= quantity

    order = Order(
        customer_name=data["customer_name"],
        product_id=product.id,
        quantity=quantity,
        status="PLACED",
    )

    db.session.add(order)
    db.session.commit()

    return jsonify(order.to_dict()), 201