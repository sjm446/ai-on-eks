---
sidebar_label: Inference Charts
---

# AI on EKS Inference Charts

The AI on EKS Inference Charts provide a streamlined Helm-based approach to deploy AI/ML inference workloads on both GPU
and AWS Neuron (Inferentia/Trainium) hardware. This chart supports multiple deployment configurations and comes with
pre-configured values for popular models.

## Overview

The inference charts support the following deployment types:

- **GPU-based VLLM deployments** (`framework: vllm`) - Single-node VLLM inference using Kubernetes Deployment
- **GPU-based Ray-VLLM deployments** (`framework: ray-vllm`) - Distributed VLLM inference with Ray Serve
- **GPU-based Triton-VLLM deployments** (`framework: triton-vllm`) - VLLM as backend for NVIDIA Triton Inference Server
- **GPU-based AIBrix deployments** (`framework: aibrix`) - VLLM with AIBrix-specific configurations
- **GPU-based LeaderWorkerSet-VLLM deployments** (`framework: lws-vllm`) - Multi-node inference using LeaderWorkerSet
- **GPU-based Diffusers deployments** (`framework: diffusers`) - Hugging Face Diffusers for image generation
- **Neuron-based VLLM deployments** - VLLM inference on AWS Inferentia chips
- **Neuron-based Ray-VLLM deployments** - Distributed VLLM inference with Ray on Inferentia

## Prerequisites

Before deploying the inference charts, ensure you have:

- Amazon EKS cluster with GPU or AWS Neuron
  nodes ([inference-ready cluster](../../infra/ai-ml/inference-ready-cluster.md) for a quick start)
- Helm 3.0+
- For GPU deployments: NVIDIA device plugin installed
- For Neuron deployments: AWS Neuron device plugin installed
- For LeaderWorkerSet deployments: LeaderWorkerSet CRD installed
- Hugging Face Hub token (stored as a Kubernetes secret named `hf-token`)
- For Ray: KubeRay Infrastructure
- For AIBrix: AIBrix Infrastructure

## Quick Start

### 1. Create Hugging Face Token Secret

Create a Kubernetes secret with your [Hugging Face token](https://huggingface.co/docs/hub/en/security-tokens):

```bash
kubectl create secret generic hf-token --from-literal=token=your_huggingface_token
```

### 2. Deploy a Pre-configured Model

Choose from the available pre-configured models and deploy:

:::warning

These deployments will need GPU/Neuron resources which need to
be [enabled](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html) and cost more than CPU only
instances.

:::

```bash
# Deploy Llama 3.2 1B on GPU with vLLM
helm install llama-inference ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-32-1b-vllm.yaml

# Deploy DeepSeek R1 Distill on GPU with Ray-vLLM
helm install deepseek-inference ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-deepseek-r1-distill-llama-8b-ray-vllm-gpu.yaml
```

## Supported Models

The inference charts include pre-configured values files for the following models:

### GPU Language Models

| Model                         | Size | Framework              | Values File                                             |
|-------------------------------|------|------------------------|---------------------------------------------------------|
| **DeepSeek R1 Distill Llama** | 8B   | Ray-VLLM               | `values-deepseek-r1-distill-llama-8b-ray-vllm-gpu.yaml` |
| **Llama 3.2**                 | 1B   | VLLM                   | `values-llama-32-1b-vllm.yaml`                          |
| **Llama 3.2**                 | 1B   | Ray-VLLM               | `values-llama-32-1b-ray-vllm.yaml`                      |
| **Llama 3.2**                 | 1B   | Ray-VLLM + Autoscaling | `values-llama-32-1b-ray-vllm-autoscaling.yaml`          |
| **Llama 3.2**                 | 1B   | AIBrix                 | `values-llama-32-1b-aibrix.yaml`                        |
| **Llama 3.2**                 | 1B   | Triton-VLLM            | `values-llama-32-1b-triton-vllm-gpu.yaml`               |
| **Llama 4 Scout**             | 17B  | VLLM                   | `values-llama-4-scout-17b-vllm.yaml`                    |
| **Llama 4 Scout**             | 17B  | LWS-VLLM               | `values-llama-4-scout-17b-lws-vllm.yaml`                |
| **Mistral Small**             | 24B  | Ray-VLLM               | `values-mistral-small-24b-ray-vllm.yaml`                |
| **GPT OSS**                   | 20B  | VLLM                   | `values-gpt-oss-20b-vllm.yaml`                          |

### GPU Diffusion Models

| Model                    | Type            | Framework | Values File                                        |
|--------------------------|-----------------|-----------|----------------------------------------------------|
| **FLUX.1 Schnell**       | Text-to-Image   | Diffusers | `values-flux-1-diffusers.yaml`                     |
| **Kolors**               | Artistic Images | Diffusers | `values-kolors-diffusers.yaml`                     |
| **Stable Diffusion 3.5** | Text-to-Image   | Diffusers | `values-stable-diffusion-3.5-large-diffusers.yaml` |
| **Stable Diffusion XL**  | Text-to-Image   | Diffusers | `values-stable-diffusion-xl-base-1-diffusers.yaml` |
| **Latent Diffusion**     | Text-to-Image   | Diffusers | `values-latent-diffusion-diffusers.yaml`           |
| **OmniGen**              | Multi-modal     | Diffusers | `values-omni-gen-diffusers.yaml`                   |

### Neuron Models (AWS Inferentia/Trainium)

| Model                         | Size | Framework | Values File                                            |
|-------------------------------|------|-----------|--------------------------------------------------------|
| **DeepSeek R1 Distill Llama** | 8B   | VLLM      | `values-deepseek-r1-distill-llama-8b-vllm-neuron.yaml` |
| **Llama 2**                   | 13B  | Ray-VLLM  | `values-llama-2-13b-ray-vllm-neuron.yaml`              |
| **Llama 3**                   | 70B  | Ray-VLLM  | `values-llama-3-70b-ray-vllm-neuron.yaml`              |
| **Llama 3.1**                 | 8B   | VLLM      | `values-llama-31-8b-vllm-neuron.yaml`                  |
| **Llama 3.1**                 | 8B   | Ray-VLLM  | `values-llama-31-8b-ray-vllm-neuron.yaml`              |

## Deployment Examples

### GPU Language Model Deployments

#### Deploy Llama 3.2 1B with VLLM

```bash
helm install llama32-vllm ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-32-1b-vllm.yaml
```

#### Deploy DeepSeek R1 Distill with Ray-VLLM

```bash
helm install deepseek-ray ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-deepseek-r1-distill-llama-8b-ray-vllm-gpu.yaml
```

#### Deploy Llama 4 Scout 17B with LeaderWorkerSet-VLLM

```bash
helm install llama4-lws ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-4-scout-17b-lws-vllm.yaml
```

#### Deploy Llama 3.2 1B with AIBrix

```bash
helm install llama32-aibrix ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-32-1b-aibrix.yaml
```

#### Deploy Llama 3.2 1B with Triton-VLLM

```bash
helm install llama32-triton ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-32-1b-triton-vllm-gpu.yaml
```

#### Deploy Ray-VLLM with Autoscaling

```bash
helm install llama32-autoscale ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-32-1b-ray-vllm-autoscaling.yaml
```

### GPU Diffusion Model Deployments

#### Deploy FLUX.1 Schnell for Image Generation

```bash
helm install flux-diffusers ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-flux-1-diffusers.yaml
```

#### Deploy Stable Diffusion XL Base 1.0

```bash
helm install sdxl-diffusers ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-stable-diffusion-xl-base-1-diffusers.yaml
```

#### Deploy Stable Diffusion 3.5 Large

```bash
helm install sd3-diffusers ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-stable-diffusion-3.5-large-diffusers.yaml
```

#### Deploy Kolors for Artistic Image Generation

```bash
helm install kolors-diffusers ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-kolors-diffusers.yaml
```

### Neuron Deployments

#### Deploy Llama 3.1 8B with VLLM on Inferentia

```bash
helm install llama31-neuron ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-31-8b-vllm-neuron.yaml
```

#### Deploy Llama 3 70B with Ray-VLLM on Inferentia

```bash
helm install llama3-70b-neuron ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-llama-3-70b-ray-vllm-neuron.yaml
```

#### Deploy DeepSeek R1 Distill with VLLM on Inferentia

```bash
helm install deepseek-neuron ./blueprints/inference/inference-charts \
  --values ./blueprints/inference/inference-charts/values-deepseek-r1-distill-llama-8b-vllm-neuron.yaml
```

## Configuration Options

### Key Parameters

The chart provides extensive configuration options. Here are the most important parameters:

| Parameter                                       | Description                                                                           | Default                     |
|-------------------------------------------------|---------------------------------------------------------------------------------------|-----------------------------|
| `inference.accelerator`                         | Accelerator type (`gpu` or `neuron`)                                                  | `gpu`                       |
| `inference.framework`                           | Framework type (`vllm`, `ray-vllm`, `triton-vllm`, `aibrix`, `lws-vllm`, `diffusers`) | `vllm`                      |
| `inference.serviceName`                         | Name of the inference service                                                         | `inference`                 |
| `inference.serviceNamespace`                    | Namespace for the inference service                                                   | `default`                   |
| `inference.modelServer.deployment.replicas`     | Number of replicas                                                                    | `1`                         |
| `inference.modelServer.deployment.instanceType` | Node selector for instance type                                                       | Not set                     |
| `inference.rayOptions.rayVersion`               | Ray version to use (for Ray deployments)                                              | `2.47.0`                    |
| `inference.rayOptions.autoscaling.enabled`      | Enable Ray native autoscaling                                                         | `false`                     |
| `model`                                         | Model ID from Hugging Face Hub                                                        | `NousResearch/Llama-3.2-1B` |
| `modelParameters.gpuMemoryUtilization`          | GPU memory utilization                                                                | `0.8`                       |
| `modelParameters.maxModelLen`                   | Maximum model sequence length                                                         | `8192`                      |
| `modelParameters.maxNumSeqs`                    | Maximum number of sequences                                                           | `4`                         |
| `modelParameters.maxNumBatchedTokens`           | Maximum number of batched tokens                                                      | `8192`                      |
| `modelParameters.pipelineParallelSize`          | Pipeline parallel size                                                                | `1`                         |
| `modelParameters.tensorParallelSize`            | Tensor parallel size                                                                  | `1`                         |
| `modelParameters.enablePrefixCaching`           | Enable prefix caching                                                                 | `true`                      |
| `modelParameters.pipeline`                      | Pipeline type for diffusers framework                                                 | Not set                     |
| `service.type`                                  | Service type                                                                          | `ClusterIP`                 |
| `service.port`                                  | Service port                                                                          | `8000`                      |

### Framework-Specific Parameters

#### Ray-VLLM Specific Options

| Parameter                                                     | Description                      | Default       |
|---------------------------------------------------------------|----------------------------------|---------------|
| `inference.rayOptions.gcs.highAvailability.enabled`           | Enable GCS high availability     | `false`       |
| `inference.rayOptions.gcs.highAvailability.redis.address`     | Address for redis                | `redis.redis` |
| `inference.rayOptions.gcs.highAvailability.redis.port`        | Port for redis                   | `6379`        |
| `inference.rayOptions.autoscaling.upscalingMode`              | Ray autoscaler upscaling mode    | `Default`     |
| `inference.rayOptions.autoscaling.idleTimeoutSeconds`         | Idle timeout before scaling down | `60`          |
| `inference.rayOptions.autoscaling.actorAutoscaling.minActors` | Minimum number of actors         | `1`           |
| `inference.rayOptions.autoscaling.actorAutoscaling.maxActors` | Maximum number of actors         | `1`           |

#### Diffusers Pipeline Types

| Pipeline Type      | Description                                                     | Example Models                        |
|--------------------|-----------------------------------------------------------------|---------------------------------------|
| `flux`             | Standard Stable Diffusion pipeline for text-to-image generation | FLUX.1-schnell                        |
| `diffusion`        | Generic diffusion pipeline for various diffusion models         | Stable Diffusion XL, Latent Diffusion |
| `kolors`           | Kolors-specific pipeline for Kolors diffusion models            | Kwai-Kolors/Kolors-diffusers          |
| `stablediffusion3` | Stable Diffusion 3.x pipeline with enhanced capabilities        | Stable Diffusion 3.5 Large            |
| `omnigen`          | OmniGen pipeline for multi-modal generation                     | Shitao/OmniGen-v1                     |

### Custom Deployment

Create your own values file for custom configurations:

```yaml
inference:
  accelerator: gpu  # or neuron
  framework: vllm   # vllm, ray-vllm, triton-vllm, aibrix, lws-vllm, or diffusers
  serviceName: custom-inference
  serviceNamespace: default

  # Ray-specific options (only for ray-vllm framework)
  rayOptions:
    rayVersion: 2.47.0
    autoscaling:
      enabled: false
      upscalingMode: "Default"
      idleTimeoutSeconds: 60
      actorAutoscaling:
        minActors: 1
        maxActors: 1

  modelServer:
    # For Ray deployments, specify VLLM and Python versions
    vllmVersion: 0.9.1
    pythonVersion: 3.11
    image:
      repository: vllm/vllm-openai  # Use rayproject/ray for Ray deployments
      tag: v0.9.1
    deployment:
      replicas: 1
      instanceType: g5.2xlarge  # Optional instance type selector
      resources:
        gpu:
          requests:
            nvidia.com/gpu: 1
          limits:
            nvidia.com/gpu: 1

model: "NousResearch/Llama-3.2-1B"
modelParameters:
  gpuMemoryUtilization: 0.8
  maxModelLen: 8192
  maxNumSeqs: 4
  maxNumBatchedTokens: 8192
  tokenizerPoolSize: 4
  maxParallelLoadingWorkers: 2
  pipelineParallelSize: 1
  tensorParallelSize: 1
  enablePrefixCaching: true
  numGpus: 1

# For diffusers deployments, use this configuration instead:
# model: "stabilityai/stable-diffusion-xl-base-1.0"
# modelParameters:
#   pipeline: diffusion
```

Deploy with custom values:

```bash
helm install custom-inference ./blueprints/inference/inference-charts \
  --values custom-values.yaml
```

## API Endpoints

### VLLM and Ray-VLLM Deployments

The deployed service exposes OpenAI-compatible API endpoints:

- **`/v1/models`** - List available models
- **`/v1/completions`** - Text completion API
- **`/v1/chat/completions`** - Chat completion API
- **`/metrics`** - Prometheus metrics endpoint

### Triton-VLLM Deployments

The deployed service exposes Triton Inference Server API endpoints:

**HTTP API (Port 8000):**

- **`/v2/health/live`** - Liveness check
- **`/v2/health/ready`** - Readiness check
- **`/v2/models`** - List available models
- **`/v2/models/vllm_model/generate`** - Model inference endpoint

**gRPC API (Port 8001):**

- Standard Triton gRPC inference protocol

**Metrics (Port 8002):**

- **`/metrics`** - Prometheus metrics endpoint

### Diffusers Deployments

The deployed service exposes REST API endpoints for image generation:

- **`/v1/generations`** - Primary image generation endpoint

### Example API Usage

Note: These deployments do not create an ingress, you will need to `kubectl port-forward` to test from your machine.

#### For VLLM/Ray-VLLM deployments:

```bash
kubectl get svc | grep deepseek
# Note the service name for deepseek, in this case deepseekr1-dis-llama-8b-ray-vllm
kubectl port-forward svc/deepseekr1-dis-llama-8b-ray-vllm 8000
```

```bash
# List models
curl http://localhost:8000/v1/models

# Chat completion
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

#### For Triton-VLLM deployments:

```bash
# Check model status
curl http://localhost:8000/v2/models/llama-3-2-1b

# Run inference
curl -X POST http://localhost:8000/v2/models/vllm_model/generate \
  -H 'Content-Type: application/json' \
  -d '{"text_input":"what is the capital of France?"}'
```

#### For Diffusers deployments:

```bash
# Generate an image using the diffusers API
curl -X POST http://localhost:8000/v1/generations \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "A beautiful sunset over mountains"
  }'
```

## Monitoring and Observability

The charts include built-in observability features:

- **Fluent Bit** for log collection
- **Prometheus metrics** for monitoring
- **Grafana dashboards** for visualizations

Access metrics at the `/metrics` endpoint of your deployed service.

## Troubleshooting

### Common Issues

1. **Pod stuck in Pending state**
    - Check if GPU/Neuron nodes are available
    - Verify resource requests match available hardware
    - For LeaderWorkerSet deployments: Ensure LeaderWorkerSet CRD is installed

2. **Model download failures**
    - Ensure Hugging Face token is correctly configured as secret `hf-token`
    - Check network connectivity to Hugging Face Hub
    - Verify model ID is correct and accessible

3. **Out of memory errors**
    - Adjust `gpuMemoryUtilization` parameter (try reducing from 0.8 to 0.7)
    - Consider using tensor parallelism for larger models
    - For large models, use LeaderWorkerSet or Ray deployments with multiple GPUs

4. **Ray deployment issues**
    - Ensure KubeRay infrastructure is installed
    - Check Ray cluster status and worker connectivity
    - Verify Ray version compatibility

5. **Triton deployment issues**
    - Check Triton server logs for model loading errors
    - Verify model repository configuration
    - Ensure proper health check endpoints are accessible

### Logs

Check deployment logs based on framework:

#### For VLLM deployments:

```bash
kubectl logs -l app.kubernetes.io/component=<service-name>
```

#### For Ray deployments:

```bash
# Check Ray head logs
kubectl logs -l ray.io/node-type=head

# Check Ray worker logs
kubectl logs -l ray.io/node-type=worker

# Check Ray cluster status
kubectl exec -it <ray-head-pod> -- ray status
```

#### For LeaderWorkerSet deployments:

```bash
# Check leader logs
kubectl logs -l leaderworkerset.sigs.k8s.io/role=leader

# Check worker logs
kubectl logs -l leaderworkerset.sigs.k8s.io/role=worker
```

#### For Triton deployments:

```bash
kubectl logs -l app.kubernetes.io/component=<service-name>
```

## Next Steps

- Explore [GPU-specific configurations](/docs/category/gpu-inference-on-eks) for GPU deployments
- Learn about [Neuron-specific configurations](/docs/category/neuron-inference-on-eks) for Inferentia deployments
