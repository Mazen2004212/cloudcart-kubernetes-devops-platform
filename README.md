# CloudCart — Production-Ready 3-Tier Kubernetes Platform

![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5?style=for-the-badge\&logo=kubernetes\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge\&logo=flask\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-Ingress-009639?style=for-the-badge\&logo=nginx\&logoColor=white)

CloudCart is a production-style 3-tier Kubernetes platform built with a React dashboard, Flask API, PostgreSQL database, Docker, NGINX Ingress, Metrics Server, and Horizontal Pod Autoscaling.

The project demonstrates how a full-stack application can be containerized, deployed to Kubernetes, exposed through production-style routing, monitored through health and metrics endpoints, and automatically scaled under CPU load.

---

## Project Highlights

* Built a full 3-tier application: frontend, backend, and database.
* Containerized all services using Docker.
* Created a local full-stack environment using Docker Compose.
* Deployed the platform to Kubernetes using Deployments and Services.
* Used ConfigMaps and Secrets for environment-based configuration.
* Added persistent PostgreSQL storage using a PersistentVolumeClaim.
* Exposed the application using NGINX Ingress and a local domain.
* Implemented liveness and readiness probes.
* Added Prometheus-compatible backend metrics.
* Installed Metrics Server for resource metrics.
* Configured Horizontal Pod Autoscaling for the backend.
* Performed a load test that scaled backend replicas from 2 to 6.

---

## Architecture

```text
User Browser
    |
    | http://cloudcart.local
    v
NGINX Ingress Controller
    |
    |-- /              --> cloudcart-frontend Service --> React + NGINX Pods
    |
    |-- /api/*         --> cloudcart-backend Service  --> Flask API Pods
                                                        |
                                                        v
                                                PostgreSQL Service
                                                        |
                                                        v
                                                PostgreSQL Pod + PVC
```

---

## Tech Stack

| Layer            | Technology                                                     |
| ---------------- | -------------------------------------------------------------- |
| Frontend         | React, Vite, NGINX                                             |
| Backend          | Python, Flask, SQLAlchemy, Gunicorn                            |
| Database         | PostgreSQL                                                     |
| Containerization | Docker, Docker Compose                                         |
| Orchestration    | Kubernetes                                                     |
| Routing          | NGINX Ingress Controller                                       |
| Configuration    | ConfigMap, Secret                                              |
| Storage          | PersistentVolumeClaim                                          |
| Observability    | Health checks, readiness checks, Prometheus-compatible metrics |
| Autoscaling      | Metrics Server, Horizontal Pod Autoscaler                      |
| Local Cluster    | Docker Desktop Kubernetes                                      |

---

## Screenshots

### CloudCart Dashboard

![CloudCart Dashboard](screenshots/dashboard-cloudcart-local.png)

### Kubernetes Pods Running

![Kubernetes Pods](screenshots/kubernetes-pods-running.png)

### Kubernetes Services

![Kubernetes Services](screenshots/kubernetes-services.png)

### NGINX Ingress

![Kubernetes Ingress](screenshots/ingress-cloudcart-local.png)

### HPA Scaling: Backend Replicas Scaled from 2 to 6

![HPA Scaling](screenshots/hpa-scaled-to-6-replicas.png)

### Pod Resource Usage During Load Test

![Top Pods](screenshots/top-pods-load-test.png)

### API Health and Readiness Checks

![API Health Checks](screenshots/api-health-ready-checks.png)

---

## Application Features

CloudCart provides a dashboard for managing products and orders.

| Feature             | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| Product management  | Add and list products                                       |
| Order management    | Place and list customer orders                              |
| Inventory tracking  | Product stock updates after order creation                  |
| Analytics dashboard | Total products, orders, revenue, stock, and inventory value |
| Health endpoint     | Confirms API availability                                   |
| Readiness endpoint  | Confirms database connectivity                              |
| Metrics endpoint    | Exposes Prometheus-compatible HTTP metrics                  |
| Stress endpoint     | Generates CPU load for autoscaling tests                    |

---

## API Endpoints

| Endpoint                 | Method | Description                         |
| ------------------------ | ------ | ----------------------------------- |
| `/api/health`            | GET    | API health check                    |
| `/api/ready`             | GET    | Database readiness check            |
| `/api/products`          | GET    | List products                       |
| `/api/products`          | POST   | Create product                      |
| `/api/orders`            | GET    | List orders                         |
| `/api/orders`            | POST   | Create order                        |
| `/api/analytics/summary` | GET    | Dashboard analytics summary         |
| `/api/metrics`           | GET    | Prometheus-compatible metrics       |
| `/api/stress`            | GET    | CPU stress endpoint for HPA testing |

---

## Local Docker Setup

### 1. Start the full stack

```bash
docker compose up --build
```

### 2. Open the application

```text
http://localhost:3000
```

### 3. Test the API through the frontend NGINX proxy

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ready
```

---

## Kubernetes Local Deployment

This project was deployed and tested on Docker Desktop Kubernetes.

### 1. Verify Kubernetes

```bash
kubectl get nodes
```

Expected output:

```text
docker-desktop   Ready
```

### 2. Build local images

```bash
docker build -t cloudcart-backend:local ./backend
docker build -t cloudcart-frontend:local --build-arg VITE_API_BASE_URL=/api ./frontend
```

### 3. Apply Kubernetes manifests

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-secret.yaml
kubectl apply -f k8s/03-postgres.yaml
kubectl apply -f k8s/04-backend.yaml
kubectl apply -f k8s/04b-backend-alias.yaml
kubectl apply -f k8s/05-frontend.yaml
```

### 4. Verify workloads

```bash
kubectl get pods -n cloudcart
kubectl get svc -n cloudcart
```

---

## Ingress Setup

### 1. Install NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/cloud/deploy.yaml
```

### 2. Wait for the controller to become ready

```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

### 3. Add local domain to hosts file

On Windows, open this file as Administrator:

```text
C:\Windows\System32\drivers\etc\hosts
```

Add:

```text
127.0.0.1 cloudcart.local
```

### 4. Apply Ingress

```bash
kubectl apply -f k8s/06-ingress.yaml
```

### 5. Open the application

```text
http://cloudcart.local
```

### 6. Test API through Ingress

```bash
curl http://cloudcart.local/api/health
curl http://cloudcart.local/api/ready
```

---

## Horizontal Pod Autoscaling

CloudCart uses Kubernetes HPA to scale backend replicas based on CPU utilization.

### 1. Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 2. Patch Metrics Server for Docker Desktop Kubernetes

```bash
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {
    "op": "replace",
    "path": "/spec/template/spec/containers/0/args",
    "value": [
      "--cert-dir=/tmp",
      "--secure-port=10250",
      "--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname",
      "--kubelet-use-node-status-port",
      "--metric-resolution=15s",
      "--kubelet-insecure-tls"
    ]
  }
]'
```

### 3. Verify Metrics Server

```bash
kubectl top nodes
kubectl top pods -n cloudcart
```

### 4. Apply HPA

```bash
kubectl apply -f k8s/07-hpa.yaml
```

### 5. Verify HPA

```bash
kubectl get hpa -n cloudcart
```

Configuration:

| Setting           | Value               |
| ----------------- | ------------------- |
| Target deployment | `cloudcart-backend` |
| Minimum replicas  | 2                   |
| Maximum replicas  | 6                   |
| CPU target        | 50%                 |

During load testing, the backend scaled from 2 replicas to 6 replicas.

---

## HPA Load Test Demo

### 1. Start load generator

```bash
kubectl run load-generator -n cloudcart \
  --image=busybox:1.36 \
  --restart=Never \
  -- /bin/sh -c "while true; do wget -q -O- http://cloudcart-backend:5000/api/stress > /dev/null; done"
```

### 2. Watch autoscaling

```bash
kubectl get hpa -n cloudcart -w
```

### 3. Watch backend pods

```bash
kubectl get pods -n cloudcart -w
```

### 4. Stop load generator

```bash
kubectl delete pod load-generator -n cloudcart
```

---

## Kubernetes Resources

| Resource                | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| Namespace               | Isolates CloudCart resources                             |
| ConfigMap               | Stores non-sensitive application configuration           |
| Secret                  | Stores database username and password                    |
| PersistentVolumeClaim   | Provides persistent PostgreSQL storage                   |
| Deployment              | Runs frontend, backend, and database pods                |
| Service                 | Provides internal service discovery                      |
| Ingress                 | Exposes frontend and backend API using host/path routing |
| HorizontalPodAutoscaler | Scales backend pods based on CPU utilization             |

---

## Project Structure

```text
cloudcart-kubernetes-devops-platform/
│
├── backend/
│   ├── app/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── wsgi.py
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── k8s/
│   ├── 00-namespace.yaml
│   ├── 01-configmap.yaml
│   ├── 02-secret.yaml
│   ├── 03-postgres.yaml
│   ├── 04-backend.yaml
│   ├── 04b-backend-alias.yaml
│   ├── 05-frontend.yaml
│   ├── 06-ingress.yaml
│   └── 07-hpa.yaml
│
├── screenshots/
│   ├── dashboard-cloudcart-local.png
│   ├── kubernetes-pods-running.png
│   ├── kubernetes-services.png
│   ├── ingress-cloudcart-local.png
│   ├── hpa-scaled-to-6-replicas.png
│   ├── top-pods-load-test.png
│   └── api-health-ready-checks.png
│
├── docker-compose.yaml
├── README.md
└── .gitignore
```

---

## What This Project Demonstrates

This project demonstrates hands-on DevOps and Kubernetes skills, including:

* Containerizing multi-service applications.
* Running full-stack applications locally using Docker Compose.
* Designing Kubernetes manifests for frontend, backend, and database workloads.
* Managing application configuration with ConfigMaps and Secrets.
* Persisting database data with PVCs.
* Exposing applications through Ingress and local DNS.
* Implementing health and readiness checks.
* Exposing application-level metrics.
* Using Metrics Server and HPA for autoscaling.
* Performing load testing to validate scaling behavior.

---

## Future AWS EKS Phase

The next phase is to migrate the Kubernetes setup to AWS EKS using Terraform.

Planned AWS components:

* VPC
* Public and private subnets
* EKS cluster
* Managed node groups
* Amazon ECR
* Amazon RDS PostgreSQL
* AWS Load Balancer Controller
* IAM roles and OIDC
* ACM certificate
* Route53 DNS
* GitHub Actions CI/CD pipeline
* Terraform remote state using S3 and DynamoDB

---

## CV Summary

CloudCart is a production-style DevOps project that demonstrates Docker, Kubernetes, Ingress, autoscaling, monitoring-ready APIs, and full-stack application deployment.

The project proves hands-on experience with Kubernetes workloads, service discovery, configuration management, persistent storage, ingress routing, metrics, and CPU-based autoscaling.
