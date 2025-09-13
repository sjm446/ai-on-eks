# SGLang Deployments

This directory contains SGLang deployment configurations organized by architecture and model size.

## Directory Structure

```
sglang/
├── aggregated/
│   └── default/          # Small models (deepseek-ai/DeepSeek-R1-Distill-Llama-8B)
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
- **Separate workers** for prefill and decode phases with RadixAttention
- **Better for**: High throughput, concurrent requests, production workloads
- **Resource usage**: GPUs split between prefill and decode workers

## Quick Start

```bash
# Deploy small model aggregated
./deploy.sh sglang-aggregated-default

# Deploy small model disaggregated (1+1 GPU)
./deploy.sh sglang-disaggregated-default

# Deploy 70B model disaggregated (4+4 GPUs)
./deploy.sh sglang-disaggregated-70b
```

## Model Configurations

| Deployment | Model | GPUs | Memory | Use Case |
|------------|-------|------|--------|----------|
| `sglang-aggregated-default` | deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 1x L4 | ~24GB | Development, testing |
| `sglang-disaggregated-default` | deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 1+1x L4 | ~48GB | High-throughput testing |
| `sglang-disaggregated-70b` | nvidia/Llama-3.3-70B-Instruct-FP8 | 4+4x L4 | ~192GB | Production, multi-user |

## Key Features

- **RadixAttention** for efficient attention computation
- **Advanced caching** with prefix sharing
- **Disaggregated serving** with NIXL transfer backend
- **Page-based memory management** (page-size 16)
- **Tensor parallelism** support for large models
- **Skip tokenizer initialization** for faster startup

## SGLang Advantages

- **Prefix Caching**: Automatic sharing of common prefixes between requests
- **RadixAttention**: Memory-efficient attention mechanism
- **Fast Sampling**: Optimized token generation algorithms
- **Dynamic Batching**: Efficient request batching and scheduling

## Configuration Details

### Aggregated Default
- Single worker deployment
- Standard memory allocation
- Basic health monitoring

### Disaggregated Default
- Separate prefill and decode workers
- NIXL transfer backend for communication
- Enhanced monitoring for both workers

### Disaggregated 70B
- 4+4 GPU configuration for 70B models
- FP8 quantization support
- Production-ready setup with comprehensive monitoring

## Testing

```bash
# Test any SGLang deployment
./test.sh <deployment-name>

# Example: Test disaggregated 70B deployment
./test.sh sglang-disaggregated-70b
```

## Monitoring

SGLang deployments use simplified health checks:
- Basic liveness and readiness probes
- Exit-based health monitoring
- Log-based debugging support
