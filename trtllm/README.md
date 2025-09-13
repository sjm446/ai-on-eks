# TensorRT-LLM Deployments

This directory contains TensorRT-LLM deployment configurations organized by architecture, performance profile, and model size.

## Directory Structure

```
trtllm/
├── aggregated/
│   ├── default/          # Default settings for small models
│   ├── high-performance/ # Optimized for maximum throughput
│   └── 70b/              # 70B models with 8 GPU tensor parallelism
└── disaggregated/
    ├── default/          # Default disaggregated settings
    ├── high-performance/ # High-performance disaggregated
    └── 70b/              # 70B models with 4+4 GPU disaggregated setup
```

## Deployment Options

### Aggregated Architecture
- **Single worker** with embedded engine configurations
- **Better for**: Lower latency, simpler deployment
- **Resource usage**: All GPUs in one pod

### Disaggregated Architecture
- **Separate prefill and decode workers** with specialized configurations
- **Better for**: High throughput, concurrent requests, production workloads
- **Resource usage**: GPUs split between prefill and decode workers

## Quick Start

⚠️ **NGC Authentication Required**: All TensorRT-LLM deployments require NGC authentication.

```bash
# Deploy small model with default settings
./deploy.sh trtllm-aggregated-default

# Deploy optimized for high performance
./deploy.sh trtllm-aggregated-high-performance

# Deploy 70B model aggregated (8 GPUs)
./deploy.sh trtllm-aggregated-70b

# Deploy disaggregated with default settings (1+1 GPU)
./deploy.sh trtllm-disaggregated-default

# Deploy disaggregated optimized for performance (1+1 GPU)
./deploy.sh trtllm-disaggregated-high-performance

# Deploy 70B model disaggregated (4+4 GPUs)
./deploy.sh trtllm-disaggregated-70b
```

## Configuration Profiles

| Deployment | Model | GPUs | Batch Size | Max Tokens | Use Case |
|------------|-------|------|------------|------------|----------|
| `trtllm-aggregated-default` | Qwen/Qwen3-0.6B | 1x L4 | 16 | 8192 | Development |
| `trtllm-aggregated-high-performance` | Qwen/Qwen3-0.6B | 1x L4 | 32 | 16384 | High throughput |
| `trtllm-aggregated-70b` | nvidia/Llama-3.3-70B-Instruct-FP8 | 8x L4 | 4 | 28800 | Production 70B |
| `trtllm-disaggregated-default` | Qwen/Qwen3-0.6B | 1+1x L4 | 16 | 8192 | Disaggregated dev |
| `trtllm-disaggregated-high-performance` | Qwen/Qwen3-0.6B | 1+1x L4 | 32 | 16384 | Disaggregated prod |
| `trtllm-disaggregated-70b` | nvidia/Llama-3.3-70B-Instruct-FP8 | 4+4x L4 | 4 | 14400 | Production 70B disagg |

## Key Features

- **Embedded engine configurations** (no external ConfigMaps)
- **Optimized CUDA graphs** for maximum performance
- **Configurable KV cache** with memory fraction control
- **Chunked prefill** support for long sequences
- **Tensor parallelism** for large models
- **Cache transceiver** for disaggregated setups

## Performance Tuning

### Default Profile
- Balanced settings for development and testing
- Conservative memory usage (85% GPU memory)
- Moderate batch sizes

### High-Performance Profile  
- Optimized for maximum throughput
- Aggressive memory usage (90% GPU memory)
- Larger batch sizes and token limits
- Higher CPU and memory requests

### 70B Profile
- Specialized for large model inference
- FP8 quantization for memory efficiency
- Multi-GPU tensor parallelism
- Optimized for production workloads

## Testing

```bash
# Test any TensorRT-LLM deployment
./test.sh <deployment-name>

# Example: Test high-performance deployment
./test.sh trtllm-aggregated-high-performance
```
