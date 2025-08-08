#!/bin/bash

# With error handling - script continues regardless
helm uninstall slurm -n slurm 2>/dev/null || true

# Remove generated files
rm -f slurm-values.yaml slurm-login-service-patch.yaml

cd ../../../infra/slinky-slurm/terraform/_LOCAL/

./cleanup.sh
