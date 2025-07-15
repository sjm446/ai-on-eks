---
sidebar_label: Inference Cluster
---

# Inference-Ready EKS Cluster

The Inference-Ready EKS Cluster is a pre-configured infrastructure solution designed specifically for AI/ML inference workloads. This solution provides a production-ready Kubernetes cluster with all the necessary components to deploy and run inference services using the AI on EKS inference charts.

## Introduction

This infrastructure blueprint creates an Amazon EKS cluster optimized for AI/ML inference workloads with the following key features:

- **KubeRay Operator**: Enables distributed Ray workloads for scalable inference
- **AI/ML Observability Stack**: Comprehensive monitoring and observability for ML workloads
- **AIBrix Stack**: Advanced inference optimization and management capabilities
- **LeaderWorkerSet**: Enables multi-node distributed inference
- **GPU/Neuron Support**: Ready for both NVIDIA GPU and AWS Neuron (Inferentia/Trainium) workloads
- **Autoscaling**: Karpenter-based node autoscaling for cost optimization

The cluster is specifically designed to work seamlessly with the AI on EKS Inference Charts, providing a complete end-to-end solution for deploying inference workloads.

## Resources

This infrastructure deploys the following AWS resources:

### Core Infrastructure
- **Amazon EKS Cluster** (v1.32 by default)
- **VPC** with public and private subnets across multiple AZs
- **NAT Gateways** for private subnet internet access
- **Internet Gateway** for public subnet access
- **Security Groups** with appropriate ingress/egress rules

### EKS Add-ons
- **AWS Load Balancer Controller** for ingress management
- **EBS CSI Driver** for persistent storage
- **VPC CNI** for pod networking
- **CoreDNS** for service discovery
- **Kube-proxy** for service networking
- **Metrics Server** for resource metrics
- **Amazon CloudWatch Observability** for logging and monitoring

### AI/ML Specific Components
- **KubeRay Operator** for distributed Ray workloads
- **LeaderWorkerSet** for multi-node distributed inference
- **NVIDIA Device Plugin** for GPU resource management
- **AWS Neuron Device Plugin** for Inferentia/Trainium support
- **Karpenter** for intelligent node autoscaling

### Observability Stack
- **Prometheus** for metrics collection
- **Grafana** for visualization and dashboards
- **AlertManager** for alerting
- **Node Exporter** for node-level metrics
- **DCGM Exporter** for GPU metrics (when GPU nodes are present)

### AIBrix Components
- **AIBrix Core** for inference optimization
- **Gateway and routing** for traffic management
- **Performance monitoring** and optimization tools

## Deployment

### Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Terraform** (>= 1.0)
3. **kubectl** for cluster management
4. **Helm** (>= 3.0) for chart deployments

### Step 1: Clone and Navigate

```bash
git clone <repository-url>
cd infra/solutions/inference-ready-cluster
```

### Step 2: Configure Variables

Edit the `terraform/blueprint.tfvars` file to customize your deployment:

```hcl
name                             = "my-inference-cluster"
region                           = "us-west-2"
enable_kuberay_operator          = true
enable_ai_ml_observability_stack = true
enable_aibrix_stack              = true
```

### Step 3: Deploy Infrastructure

```bash
# Run the installation script
./install.sh
```

The installation script will:
1. Copy the base Terraform configuration
2. Initialize Terraform
3. Plan and apply the infrastructure
4. Configure kubectl context

### Step 4: Verify Deployment

```bash
# Check cluster status
kubectl get nodes

# Verify KubeRay operator
kubectl get pods -n kuberay-operator

# Check observability stack
kubectl get pods -n monitoring

# Verify AIBrix components
kubectl get pods -n aibrix-system

# Verify LeaderWorkerSet components
kubectl get pods -n lws-system
```

## Inference Charts Integration

This infrastructure is specifically designed to work with the AI on EKS Inference Charts. The cluster provides all the necessary components and configurations for seamless deployment of inference workloads.

### Prerequisites for Inference Charts

The infrastructure automatically provides:

1. **KubeRay Operator** - Required for Ray-vLLM deployments
2. **GPU/Neuron Device Plugins** - For hardware resource management
3. **Observability Stack** - Prometheus and Grafana for monitoring
4. **AIBrix Integration** - For inference optimization and management

### Supported Inference Patterns

The cluster supports all inference patterns provided by the inference charts:

#### vLLM Deployments
- Direct vLLM deployment using Kubernetes Deployment
- Suitable for single-node inference workloads
- Supports both GPU and Neuron accelerators

#### Ray-vLLM Deployments
- Distributed vLLM on Ray Serve
- Automatic scaling based on workload demand
- Advanced observability with Prometheus/Grafana integration
- Topology-aware scheduling for optimal performance

#### AIBrix Deployments
- AIBrix backed LLM deployments
- Efficient LLM routing for multiple replicas
- Supports mixed GPU and Neuron accelerators

### Example Deployments

Once your cluster is ready, you can deploy inference workloads:

```bash
# Navigate to inference charts
cd ../../../blueprints/inference/inference-charts

# Create Hugging Face token secret
kubectl create secret generic hf-token --from-literal=token=your_hf_token

# Deploy GPU Ray-vLLM with Llama model
helm install llama-inference . \
  --values values-llama-32-1b-ray-vllm.yaml

# Deploy Neuron vLLM with optimized model
helm install neuron-inference . \
  --values values-llama-31-8b-vllm-neuron.yaml
```

### Observability Integration

The infrastructure provides comprehensive observability for inference workloads:

- **Prometheus Metrics**: Automatic collection of inference metrics
- **Grafana Dashboards**: Pre-configured dashboards for Ray and vLLM
- **Log Aggregation**: Centralized logging with Fluent Bit
- **GPU/Neuron Monitoring**: Hardware utilization metrics

Access Grafana dashboard:
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

### Cost Optimization

The cluster includes several cost optimization features:

1. **Karpenter Autoscaling**: Automatic node provisioning and deprovisioning
2. **Spot Instance Support**: Configure node groups to use spot instances
3. **Topology Awareness**: Efficient resource utilization across AZs
4. **Resource Limits**: Proper resource requests and limits for workloads

### Troubleshooting

Common issues and solutions:

1. **Node Group Creation**: Ensure proper IAM permissions for node group creation
2. **GPU Detection**: Verify NVIDIA device plugin is running on GPU nodes
3. **Neuron Setup**: Check AWS Neuron device plugin for Inferentia/Trainium nodes
4. **Resource Limits**: Monitor cluster resource usage and adjust node groups accordingly

For detailed troubleshooting, check the observability stack logs and metrics.
