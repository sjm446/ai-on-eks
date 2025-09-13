# vLLM Deployments

This directory contains vLLM deployment configurations organized by architecture and model size.

## Directory Structure

```
vllm/
├── aggregated/
│   ├── default/          # Small models (Qwen/Qwen3-8B) - single worker
│   └── 70b/              # 70B models (nvidia/Llama-3.3-70B-Instruct-FP8) - 8 GPUs
└── disaggregated/
    ├── default/          # Small models - separate prefill/decode workers
    └── 70b/              # 70B models - 4+4 GPU disaggregated setup
```

## Deployment Options

### Aggregated Architecture
- **Single worker** handles both prefill and decode phases
- **Better for**: Lower latency, simpler setup, single-user scenarios
- **Resource usage**: All GPUs in one pod

### Disaggregated Architecture  
- **Separate workers** for prefill and decode phases
- **Better for**: High throughput, concurrent requests, production workloads
- **Resource usage**: GPUs split between prefill and decode workers

## Quick Start

```bash
# Deploy small model aggregated
./deploy.sh vllm-aggregated-default

# Deploy 70B model aggregated (8 GPUs)
./deploy.sh vllm-aggregated-70b

# Deploy small model disaggregated (1+1 GPU)
./deploy.sh vllm-disaggregated-default

# Deploy 70B model disaggregated (4+4 GPUs)
./deploy.sh vllm-disaggregated-70b
```

## Model Configurations

| Deployment | Model | GPUs | Memory | Use Case |
|------------|-------|------|--------|----------|
| `vllm-aggregated-default` | Qwen/Qwen3-8B | 1x L4 | ~24GB | Development, testing |
| `vllm-aggregated-70b` | nvidia/Llama-3.3-70B-Instruct-FP8 | 8x L4 | ~192GB | Production, single-user |
| `vllm-disaggregated-default` | Qwen/Qwen3-8B | 1+1x L4 | ~48GB | High-throughput testing |
| `vllm-disaggregated-70b` | nvidia/Llama-3.3-70B-Instruct-FP8 | 4+4x L4 | ~192GB | Production, multi-user |

## Features

- **Automatic FP8 quantization** for 70B models
- **Dynamic batching** and **continuous batching**
- **KV cache optimization** with configurable memory utilization
- **Health monitoring** and **metrics collection**
- **Horizontal scaling** support for disaggregated deployments

## Testing

```bash
# Test any vLLM deployment
./test.sh <deployment-name>

# Example: Test 70B aggregated deployment
./test.sh vllm-aggregated-70b
```
