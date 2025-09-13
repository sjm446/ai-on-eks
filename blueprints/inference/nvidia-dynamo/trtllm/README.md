# TensorRT-LLM Example

⚠️ **DEPRECATED**: This directory has been replaced by multiple TensorRT-LLM variants:

- **`trtllm-default/`** - Default TensorRT-LLM configuration for small models
- **`trtllm-high-performance/`** - High-performance configuration optimized for throughput
- **`trtllm-70b/`** - Configuration for 70B models with 8x GPU tensor parallelism

## Migration Guide

Instead of using ConfigMaps, each variant now has embedded engine configurations:

```bash
# Old approach (deprecated)
./deploy.sh trtllm

# New approach - choose specific variant
./deploy.sh trtllm-default           # For small models
./deploy.sh trtllm-high-performance  # For maximum throughput
./deploy.sh trtllm-70b              # For 70B models
```

Deploy TensorRT-LLM-based LLM serving with maximum performance optimization using NVIDIA Dynamo v0.4.1.

## Architecture

```text
Client Requests → Frontend → TensorRT-LLM Worker (Aggregated + Optimized Kernels)
```

This example demonstrates:
- TensorRT-LLM backend integration with NVIDIA Dynamo
- Maximum inference performance with custom CUDA kernels
- External ConfigMap-based configuration management
- OpenAI-compatible API serving (`/v1/chat/completions`, `/v1/models`)
- Aggregated serving mode (prefill + decode in same worker)
- G5 GPU node selection for cost-effective inference

## Key Features

### TensorRT-LLM Optimizations
TensorRT-LLM provides industry-leading inference performance:
- **Custom CUDA Kernels**: Hand-optimized kernels for maximum GPU utilization
- **Memory Optimization**: Advanced KV cache management and memory pooling
- **Quantization Support**: INT8, FP8, and mixed-precision inference
- **Batching Efficiency**: Optimized dynamic batching for high throughput
- **Low Latency**: Minimal overhead for real-time applications

### External Configuration System
This example uses Kubernetes ConfigMaps for flexible configuration management:
- **Runtime Configuration Changes**: Switch between performance profiles without rebuilding
- **Environment-Specific Settings**: Different configurations for dev/staging/production
- **Version Control**: Track configuration changes separately from application code
- **Easy Customization**: Create custom configurations for specific use cases

## Prerequisites

- Dynamo platform deployed in your EKS cluster
- `dynamo-cloud` namespace with secrets configured
- G5 GPU nodes available (at least 1 GPU with 24GB VRAM)
- HuggingFace token secret configured

## Configuration Variants

This example includes two pre-configured performance profiles:

### Default Configuration
- **Use Case**: Balanced performance for most production workloads
- **Batch Size**: 16 (conservative for stability)
- **Max Tokens**: 8192
- **Memory Usage**: 85% KV cache (safe allocation)
- **Features**: Standard optimizations, chunked prefill enabled

### High-Performance Configuration
- **Use Case**: Maximum throughput for high-load scenarios
- **Batch Size**: 32 (aggressive batching)
- **Max Tokens**: 16384
- **Memory Usage**: 90% KV cache (maximum utilization)
- **Features**: All optimizations enabled, CUDA graphs

## YAML Structure Explained

### Frontend Configuration
```yaml
Frontend:
  dynamoNamespace: trtllm           # Service discovery namespace
  componentType: main               # HTTP API entry point
  replicas: 1                       # Single frontend instance
  resources:
    requests:
      cpu: "1"                      # Lightweight for request routing
      memory: "2Gi"                 # Minimal memory for HTTP server
  extraPodSpec:
    nodeSelector:
      karpenter.sh/nodepool: cpu-karpenter  # CPU-only node (cost effective)
    mainContainer:
      image: nvcr.io/nvidia/ai-dynamo/tensorrtllm-runtime:0.4.1
      workingDir: /workspace/components/backends/trtllm
      command: ["/bin/sh", "-c"]
      args: ["python3 -m dynamo.frontend --http-port 8000"]
```

### TensorRT-LLM Worker Configuration
```yaml
TRTLLMWorker:
  dynamoNamespace: trtllm           # Service discovery namespace
  componentType: worker             # Inference worker
  replicas: 1                       # Single worker instance
  envFromSecret: hf-token-secret    # HuggingFace authentication
  resources:
    requests:
      cpu: "8"                      # High CPU for model operations
      memory: "20Gi"                # Sufficient memory for model loading
      gpu: "1"                      # Single GPU allocation
  extraPodSpec:
    nodeSelector:
      karpenter.sh/nodepool: g5-gpu-karpenter  # G5 GPU nodes
    volumes:
    - name: engine-config-volume    # ConfigMap volume mount
      configMap:
        name: trtllm-engine-config-default
        items:
        - key: agg.yaml
          path: agg.yaml
    mainContainer:
      image: nvcr.io/nvidia/ai-dynamo/tensorrtllm-runtime:0.4.1
      workingDir: /workspace/components/backends/trtllm
      command: ["/bin/sh", "-c"]
      args: ["python3 -m dynamo.trtllm --extra-engine-args external_configs/agg.yaml"]
      volumeMounts:
      - name: engine-config-volume
        mountPath: /workspace/components/backends/trtllm/external_configs
        readOnly: true
```

## ConfigMap Considerations

### Why External ConfigMaps?
TensorRT-LLM requires complex engine configurations that benefit from external management:

1. **Performance Tuning**: Different workloads need different optimization settings
2. **Environment Flexibility**: Dev/staging/production can use different configurations
3. **Runtime Updates**: Change configurations without rebuilding container images
4. **Version Control**: Track configuration changes separately from application code

### ConfigMap Structure
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: trtllm-engine-config-default
  namespace: dynamo-cloud
data:
  agg.yaml: |
    tensor_parallel_size: 1
    moe_expert_parallel_size: 1
    enable_attention_dp: false
    max_num_tokens: 8192
    max_batch_size: 16
    trust_remote_code: true
    backend: pytorch
    enable_chunked_prefill: true
    kv_cache_config:
      free_gpu_memory_fraction: 0.85
    cuda_graph_config:
      max_batch_size: 16
```

### Volume Mount Integration
The ConfigMap is mounted as a volume in the worker pod:
```yaml
volumes:
- name: engine-config-volume
  configMap:
    name: trtllm-engine-config-default
    items:
    - key: agg.yaml
      path: agg.yaml

volumeMounts:
- name: engine-config-volume
  mountPath: /workspace/components/backends/trtllm/external_configs
  readOnly: true
```

## Deployment

### Option 1: Using Deploy Script (Recommended)
```bash
# Navigate to the blueprint directory
cd blueprints/inference/nvidia-dynamo

# Deploy TensorRT-LLM with interactive setup
./deploy.sh trtllm

# Or deploy directly
kubectl apply -f trtllm/configmaps/
kubectl apply -f trtllm/trtllm.yaml
```

### Option 2: Manual Deployment
```bash
# 1. Deploy ConfigMaps first
kubectl apply -f configmaps/trtllm-engine-config-default.yaml
kubectl apply -f configmaps/trtllm-engine-config-high-performance.yaml

# 2. Deploy the TensorRT-LLM service
kubectl apply -f trtllm.yaml

# 3. Verify deployment
kubectl get pods -n dynamo-cloud -l nvidia.com/dynamo-namespace=trtllm
```

### Switching Performance Profiles
```bash
# Switch to high-performance configuration
kubectl patch dynamographdeployment trtllm -n dynamo-cloud --type='merge' -p='
spec:
  services:
    TRTLLMWorker:
      extraPodSpec:
        volumes:
        - name: engine-config-volume
          configMap:
            name: trtllm-engine-config-high-performance'

# Restart to apply new configuration
kubectl rollout restart dynamographdeployment/trtllm -n dynamo-cloud
```

## Testing and Validation

### Health Check
```bash
# Check pod status
kubectl get pods -n dynamo-cloud -l nvidia.com/dynamo-namespace=trtllm

# Verify health endpoint
# Port forward via Service (recommended) - enables both API access and metrics collection
kubectl port-forward service/trtllm-frontend 8000:8000 -n dynamo-cloud

# Alternative: Direct deployment access
# kubectl port-forward deployment/trtllm-frontend 8000:8000 -n dynamo-cloud &
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "endpoints": ["dyn://dynamo.backend.generate"],
  "instances": [...]
}
```

### API Testing
```bash
# Test chat completions
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3-0.6B",
    "messages": [
      {"role": "user", "content": "What is TensorRT-LLM?"}
    ],
    "max_tokens": 100,
    "temperature": 0.7
  }'

# Test models endpoint
curl http://localhost:8000/v1/models
```

### Performance Validation
```bash
# Monitor GPU utilization
kubectl exec -it <trtllm-worker-pod> -n dynamo-cloud -- nvidia-smi

# Check worker logs for performance metrics
kubectl logs <trtllm-worker-pod> -n dynamo-cloud | grep -i "throughput\|latency"
```

## Monitoring

### Key Metrics to Monitor
- **GPU Utilization**: Should be >80% during inference
- **Memory Usage**: Monitor KV cache utilization
- **Throughput**: Tokens per second
- **Latency**: Time to first token and total response time
- **Batch Efficiency**: Actual vs configured batch sizes

### Grafana Dashboards
Access pre-configured dashboards:
```bash
kubectl port-forward -n kube-prometheus-stack svc/kube-prometheus-stack-grafana 3000:80
# Navigate to Dynamo dashboards in Grafana
```

## Troubleshooting

### Common Issues

#### Pod Fails to Start
```bash
# Check pod events
kubectl describe pod <trtllm-worker-pod> -n dynamo-cloud

# Check resource availability
kubectl describe node <node-name>

# Verify ConfigMap exists
kubectl get configmap trtllm-engine-config-default -n dynamo-cloud
```

#### Configuration Not Loading
```bash
# Verify volume mount
kubectl exec <trtllm-worker-pod> -n dynamo-cloud -- ls -la /workspace/components/backends/trtllm/external_configs/

# Check configuration content
kubectl exec <trtllm-worker-pod> -n dynamo-cloud -- cat /workspace/components/backends/trtllm/external_configs/agg.yaml
```

#### Performance Issues
```bash
# Check GPU memory usage
kubectl exec <trtllm-worker-pod> -n dynamo-cloud -- nvidia-smi

# Review worker logs for errors
kubectl logs <trtllm-worker-pod> -n dynamo-cloud --tail=100

# Switch to high-performance configuration if needed
kubectl patch dynamographdeployment trtllm -n dynamo-cloud --type='merge' -p='
spec:
  services:
    TRTLLMWorker:
      extraPodSpec:
        volumes:
        - name: engine-config-volume
          configMap:
            name: trtllm-engine-config-high-performance'
```

### Debug Commands
```bash
# Get all TensorRT-LLM resources
kubectl get all -n dynamo-cloud -l nvidia.com/dynamo-namespace=trtllm

# Check DynamoGraphDeployment status
kubectl describe dynamographdeployment trtllm -n dynamo-cloud

# View detailed pod logs
kubectl logs <trtllm-worker-pod> -n dynamo-cloud -f
```

## Performance Tuning

### For Maximum Throughput
- Use `trtllm-engine-config-high-performance` ConfigMap
- Increase `max_batch_size` to 32 or higher
- Enable CUDA graphs for reduced overhead
- Use FP16 precision throughout

### For Low Latency
- Use smaller batch sizes (8-16)
- Enable chunked prefill for faster first token
- Optimize KV cache allocation
- Consider speculative decoding

### For Memory Efficiency
- Reduce `free_gpu_memory_fraction` to 0.8 or lower
- Use INT8 quantization if model supports it
- Optimize `max_num_tokens` based on typical request sizes

## Custom Configuration

### Creating Custom ConfigMaps
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: trtllm-engine-config-custom
  namespace: dynamo-cloud
data:
  agg.yaml: |
    tensor_parallel_size: 1
    max_batch_size: 24        # Custom batch size
    max_num_tokens: 12288     # Custom token limit
    trust_remote_code: true
    backend: pytorch
    enable_chunked_prefill: true
    kv_cache_config:
      free_gpu_memory_fraction: 0.8  # Conservative memory usage
    cuda_graph_config:
      max_batch_size: 24
```

Apply and use:
```bash
kubectl apply -f custom-config.yaml
kubectl patch dynamographdeployment trtllm -n dynamo-cloud --type='merge' -p='
spec:
  services:
    TRTLLMWorker:
      extraPodSpec:
        volumes:
        - name: engine-config-volume
          configMap:
            name: trtllm-engine-config-custom'
```

## External Access

For production external access, see the main README.md **External Access** section which provides comprehensive guidance for all Dynamo deployments.

**TensorRT-LLM-Specific Notes:**
- Use NLB (Network Load Balancer) to minimize latency and maximize TensorRT optimizations
- Consider `target-type: ip` for optimal performance
- See root README.md for complete setup instructions

## Cleanup

```bash
# Remove TensorRT-LLM deployment
kubectl delete dynamographdeployment trtllm -n dynamo-cloud

# Remove ConfigMaps
kubectl delete configmap trtllm-engine-config-default trtllm-engine-config-high-performance -n dynamo-cloud
```
