# CloudCart — Production-Ready 3-Tier Kubernetes Platform

CloudCart is a production-style 3-tier application built to demonstrate real DevOps, Kubernetes, containerization, ingress routing, observability, and autoscaling concepts.

The project includes a React frontend dashboard, Flask backend API, PostgreSQL database, Dockerized services, Kubernetes deployments, NGINX Ingress routing, Metrics Server, and Horizontal Pod Autoscaling.

---

## Project Overview

CloudCart simulates a simple commerce platform where users can manage products, place orders, and view live dashboard metrics such as total products, orders, revenue, inventory value, API health, and database readiness.

This project was built as a DevOps portfolio project to demonstrate how a full-stack application can be containerized, deployed to Kubernetes, exposed through Ingress, monitored through metrics, and scaled automatically under load.

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
| Local Kubernetes | Docker Desktop Kubernetes                                      |

---

## Key Features

* Full 3-tier application architecture.
* React dashboard connected to a Flask backend API.
* PostgreSQL database with persistent storage.
* Docker Compose setup for local full-stack development.
* Kubernetes namespace, deployments, services, ConfigMap, Secret, and PVC.
* NGINX Ingress routing using `cloudcart.local`.
* Liveness and readiness probes for backend, frontend, and database.
* Prometheus-compatible `/api/metrics` endpoint.
* CPU-based Horizontal Pod Autoscaler.
* Load testing demo that scaled backend replicas from 2 to 6.
* Production-style resource requests and limits.

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

### HPA Scaled Backend to 6 Replicas

![HPA Scaling](screenshots/hpa-scaled-to-6-replicas.png)

### Pod Resource Usage During Load Test

![Top Pods](screenshots/top-pods-load-test.png)

### API Health and Readiness Checks

![API Health Checks](screenshots/api-health-ready-checks.png)

---

## Application API Endpoints

| Endpoint                 | Method | Description                       |
| ------------------------ | ------ | --------------------------------- |
| `/api/health`            | GET    | API health check                  |
| `/api/ready`             | GET    | Database readiness check          |
| `/api/products`          | GET    | List products                     |
| `/api/products`          | POST   | Create product                    |
| `/api/orders`            | GET    | List orders                       |
| `/api/orders`            | POST   | Create order                      |
| `/api/analytics/summary` | GET    | Dashboard analytics summary       |
| `/api/metrics`           | GET    | Prometheus-compatible metrics     |
| `/api/stress`            | GET    | CPU load endpoint for HPA testing |

---

## Local Docker Setup

### 1. Build and run the full stack

```bash
docker compose up --build
```

### 2. Open the application

```text
http://localhost:3000
```

### 3. Test API through the frontend NGINX proxy

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ready
```

---

## Kubernetes Local Deployment

This project was deployed and tested on Docker Desktop Kubernetes.

### 1. Verify Kubernetes cluster

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

### 4. Verify pods and services

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

### 2. Wait for the controller

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

### 4. Apply ingress manifest

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

### 3. Verify metrics

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

The backend was configured with:

```text
Minimum replicas: 2
Maximum replicas: 6
CPU target: 50%
```

During load testing, the backend scaled from 2 replicas to 6 replicas.

---

## Load Test for HPA Demo

### 1. Start load generator

```bash
kubectl run load-generator -n cloudcart \
  --image=busybox:1.36 \
  --restart=Never \
  -- /bin/sh -c "while true; do wget -q -O- http://cloudcart-backend:5000/api/stress > /dev/null; done"
```

### 2. Watch HPA

```bash
kubectl get hpa -n cloudcart -w
```

### 3. Watch pods

```bash
kubectl get pods -n cloudcart -w
```

### 4. Stop load generator

```bash
kubectl delete pod load-generator -n cloudcart
```

---

## Kubernetes Resources Used

| Resource   | Purpose                                         |
| ---------- | ----------------------------------------------- |
| Namespace  | Isolates CloudCart resources                    |
| ConfigMap  | Stores non-sensitive app configuration          |
| Secret     | Stores database username and password           |
| PVC        | Provides persistent PostgreSQL storage          |
| Deployment | Runs frontend, backend, and database pods       |
| Service    | Provides internal service discovery             |
| Ingress    | Exposes frontend and API using hostname routing |
| HPA        | Scales backend pods based on CPU utilization    |

---

## Project Structure

```text
eks-3tier-devops-project/
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
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Future AWS EKS Phase

The next phase of this project is to migrate the Kubernetes setup to AWS EKS using Terraform.

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

CloudCart is a production-style DevOps project demonstrating Docker, Kubernetes, Ingress, autoscaling, monitoring-ready APIs, and full-stack application deployment. The project proves hands-on experience with Kubernetes workloads, service discovery, configuration management, persistent storage, ingress routing, metrics, and CPU-based autoscaling.
