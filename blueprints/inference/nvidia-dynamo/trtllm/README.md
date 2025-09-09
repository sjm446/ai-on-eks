# TensorRT-LLM External Configuration

This directory contains the implementation for externalizing TensorRT-LLM engine configurations using Kubernetes ConfigMaps, allowing for runtime configuration switching without rebuilding container images.

## Overview

The implementation provides two deployment approaches:

1. **Standard Deployment** (`trtllm.yaml`) - Original deployment with embedded configuration
2. **External Configuration Deployment** (`trtllm-with-external-config.yaml`) - Enhanced deployment with ConfigMap support

## Directory Structure

```
blueprints/inference/nvidia-dynamo/trtllm/
├── README.md                          # This guide
├── trtllm.yaml                        # Original deployment (backward compatible)
├── trtllm-with-external-config.yaml   # Enhanced deployment with ConfigMaps
├── engine_configs/                    # Local configuration files
│   ├── agg.yaml                      # Default configuration
│   └── agg-high-performance.yaml     # High-performance variant
└── configmaps/                       # Kubernetes ConfigMap manifests
    ├── trtllm-engine-config-default.yaml
    └── trtllm-engine-config-high-performance.yaml
```

## Configuration Variants

### Default Configuration (`agg.yaml`)
- **Use Case**: Balanced performance for most production workloads
- **Batch Size**: 128
- **Max Input Length**: 2048 tokens
- **Memory Usage**: Conservative (85% KV cache)
- **Precision**: float16 with float32 logits
- **Features**: Standard plugins enabled, no quantization

### High-Performance Configuration (`agg-high-performance.yaml`)
- **Use Case**: Maximum throughput for high-load scenarios
- **Batch Size**: 256
- **Max Input Length**: 4096 tokens
- **Memory Usage**: Aggressive (90% KV cache)
- **Precision**: float16 throughout
- **Features**: All optimizations enabled, INT8 weight quantization, FP8 KV cache

## How the ConfigMap System Works

The external configuration system uses Kubernetes ConfigMaps to store TensorRT-LLM engine configurations separately from the container image. This approach provides several benefits:

- **Runtime Configuration Changes**: Switch between configurations without rebuilding containers
- **Environment-Specific Settings**: Different configurations for development, staging, and production
- **Version Control**: Track configuration changes separately from application code
- **Flexibility**: Easy to create custom configurations for specific use cases

The system works by:
1. ConfigMaps store engine configuration files as data
2. The enhanced deployment mounts ConfigMaps as volumes
3. TensorRT-LLM worker reads configuration from mounted files
4. Configuration changes trigger pod restarts to apply new settings

## Quick Start

### 1. Deploy ConfigMaps
```bash
# Deploy individual configuration variants
kubectl apply -f configmaps/trtllm-engine-config-default.yaml
kubectl apply -f configmaps/trtllm-engine-config-high-performance.yaml
```

### 2. Deploy TRTLLMWorker with External Configuration
```bash
# Deploy with default configuration
kubectl apply -f trtllm-with-external-config.yaml
```

### 3. Switch Configurations at Runtime
```bash
# Update to high-performance configuration
kubectl patch DynamoGraphDeployment trtllm --type='merge' -p='
spec:
  services:
    TRTLLMWorker:
      extraPodSpec:
        volumes:
        - name: engine-config-volume
          configMap:
            name: trtllm-engine-config-high-performance
            items:
            - key: agg.yaml
              path: agg.yaml'

# Restart pods to pick up new configuration
kubectl rollout restart DynamoGraphDeployment/trtllm
```

## Advanced Configuration

### Custom Engine Configuration
1. Create a custom ConfigMap with your engine settings:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: trtllm-engine-config-custom
data:
  agg.yaml: |
    max_batch_size: 64
    max_input_len: 1024
    # ... your custom settings
```

2. Update the deployment to use the custom ConfigMap:
```bash
kubectl patch DynamoGraphDeployment trtllm --type='merge' -p='
spec:
  services:
    TRTLLMWorker:
      extraPodSpec:
        volumes:
        - name: engine-config-volume
          configMap:
            name: trtllm-engine-config-custom'
```

### Environment-Based Configuration Selection
The deployment supports environment variable-driven configuration selection:

```yaml
envs:
  - name: TRTLLM_CONFIG_VARIANT
    value: "high-performance"  # Options: default, high-performance
```

## Integration with Root Shell Scripts

This TensorRT-LLM external configuration solution integrates seamlessly with the root-level shell scripts in the ai-on-eks repository:

1. **Standard Deployment**: Use existing shell scripts with `trtllm.yaml` for embedded configurations
2. **External Configuration**: Deploy ConfigMaps first, then use shell scripts with `trtllm-with-external-config.yaml`
3. **Runtime Switching**: ConfigMaps can be updated independently of shell script deployments

Example integration workflow:
```bash
# 1. Deploy infrastructure using root shell scripts
./install.sh --blueprint nvidia-dynamo

# 2. Deploy TensorRT-LLM ConfigMaps
kubectl apply -f blueprints/inference/nvidia-dynamo/trtllm/configmaps/

# 3. Deploy TensorRT-LLM with external configuration
kubectl apply -f blueprints/inference/nvidia-dynamo/trtllm/trtllm-with-external-config.yaml
```

## Backward Compatibility

The original `trtllm.yaml` deployment remains fully functional and unchanged. Existing deployments will continue to work without modification.

## Troubleshooting

### Configuration Not Applied
1. Verify ConfigMap exists: `kubectl get configmap`
2. Check volume mount: `kubectl describe pod <trtllm-worker-pod>`
3. Verify file content: `kubectl exec <pod> -- cat /workspace/components/backends/trtllm/engine_configs/agg.yaml`

### Performance Issues
1. For high throughput: Use `high-performance` variant
2. For memory constraints: Use `default` variant with reduced batch sizes

### Configuration Validation
Test configuration validity before deployment:
```bash
# Validate YAML syntax
kubectl apply --dry-run=client -f configmaps/trtllm-engine-config-default.yaml

# Validate configuration parameters
kubectl create job config-test --image=nvidia/tensorrt_llm:latest --dry-run=client -o yaml
```

## Migration Guide

### From Embedded to External Configuration

1. **Backup existing deployment**:
   ```bash
   kubectl get DynamoGraphDeployment trtllm -o yaml > trtllm-backup.yaml
   ```

2. **Deploy ConfigMaps**:
   ```bash
   kubectl apply -f configmaps/trtllm-engine-config-default.yaml
   kubectl apply -f configmaps/trtllm-engine-config-high-performance.yaml
   ```

3. **Update deployment**:
   ```bash
   kubectl apply -f trtllm-with-external-config.yaml
   ```

4. **Verify operation**:
   ```bash
   kubectl get pods -l app=trtllm
   kubectl logs <trtllm-worker-pod>
   ```

## Security Considerations

- ConfigMaps are mounted read-only to prevent runtime modification
- Use Kubernetes RBAC to control ConfigMap access
- Consider using Secrets for sensitive configuration parameters
- Validate configuration inputs to prevent injection attacks

## Performance Tuning

### Memory Optimization
- Adjust `kv_cache_percent` based on available GPU memory
- Monitor memory usage: `kubectl exec <pod> -- nvidia-smi`
- Use appropriate `max_tokens_in_paged_kv_cache` values

### Throughput Optimization
- Increase `max_batch_size` for higher throughput
- Enable `multi_block_mode` for better parallelization
- Use INT8 quantization for faster inference

### Latency Optimization
- Reduce `max_batch_size` for lower latency
- Enable `remove_input_padding` for variable-length sequences
- Use speculative decoding for faster generation

## Support

For issues related to:
- **Configuration**: Check this README and ConfigMap files
- **Deployment**: Verify Kubernetes resources and logs  
- **Performance**: Compare default vs high-performance configurations
- **TensorRT-LLM**: Refer to NVIDIA TensorRT-LLM documentation
