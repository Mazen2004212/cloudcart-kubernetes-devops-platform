from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter(
    "cloudcart_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"],
)

REQUEST_LATENCY = Histogram(
    "cloudcart_http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"],
)