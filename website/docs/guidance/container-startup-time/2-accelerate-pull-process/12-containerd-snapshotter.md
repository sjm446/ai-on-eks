---
sidebar_label: Using containerd snapshotter
---

# Using containerd snapshotter

## Using SOCI snapshotter

This solution simply relies on the organic improvements of the image pull process by plugging SOCI snapshotter ([v0.11.0](https://github.com/awslabs/soci-snapshotter/releases/tag/v0.11.0)+) into containerd. This is currently isn’t the default in EKS AMIs, but should eventually become one.

**Architecture overview**

There are no architectural changes, as this requires to bootstrap your worker nodes with the snapshotter via `userData` in the relevant Karpenter node classes or launch templates for the non-Karpenter instance provision schemes.

The new SOCI snapshotter implementation introduces a non-lazy-loading pull mode that that pulls large layers in chunks, allowing them to be pulled faster, similar in idea to the [multipart layer fetch](https://github.com/containerd/containerd/pull/10177) introduced in [containerd 2.1.0](https://github.com/containerd/containerd/releases/tag/v2.1.0). By using a temporary file buffer instead of in-memory one, SOCI is able to parallelize the layers store and decompression operations, which results in a much faster image pulls (as permitted by hardware limitations).

**Implementation guide**

Below is a schematic implementation of the above changes:

:::info
For a complete example on how to use SOCI snapshotter, please refer to [this guide](https://builder.aws.com/content/30EkTz8DbMjuqW0eHTQduc5uXi6/accelerate-container-startup-time-on-amazon-eks-with-soci-parallel-mode).
:::

```
apiVersion: karpenter.k8s.aws/v1
kind: EC2NodeClass
metadata:
  name: soci-snapshotter
spec:
  role: KarpenterNodeRole-my-cluster
  instanceStorePolicy: RAID0
  subnetSelectorTerms:
    - tags:
        karpenter.sh/discovery: my-cluster-private
  securityGroupSelectorTerms:
    - tags:
        karpenter.sh/discovery: my-cluster-private
  amiSelectorTerms:
    - alias: al2023@latest
  userData: |
    MIME-Version: 1.0
    Content-Type: multipart/mixed; boundary="//"

    --//
    Content-Type: text/x-shellscript; charset="us-ascii"

    # 1. Detect the architecture
    # 2. Download the v0.11.0+ SOCI snapshotter version
    #    at https://github.com/awslabs/soci-snapshotter/releases/download/...
    # 3. Configure the snapshotter by creating a config.toml file
    # 4. Configure the snapshotter service by creating a systemd config file
    # 5. Enable the snapshotter

    --//
    Content-Type: application/node.eks.aws

    apiVersion: node.eks.aws/v1alpha1
    kind: NodeConfig
    spec:
      kubelet:
        config:
          imageServiceEndpoint: unix:///run/soci-snapshotter-grpc/soci-snapshotter-grpc.sock
      containerd:
        config: |
          [proxy_plugins.soci]
            type = "snapshot"
            address = "/run/soci-snapshotter-grpc/soci-snapshotter-grpc.sock"
            [proxy_plugins.soci.exports]
              root = "/var/lib/containerd/io.containerd.snapshotter.v1.soci"
          [plugins."io.containerd.grpc.v1.cri".containerd]
            snapshotter = "soci"
            disable_snapshot_annotations = false
            discard_unpacked_layers = false
    --//

```


**Main benefits**

The solution provides a direct improvement to the image pull process by plugging a more performant snapshotter into containerd on a worker node.

**Additional benefits**

This solution requires no changes to the development process, no additional infrastructure and once enabled by default, no changes in code or configuration.

**Trade-offs**

Before the snapshotter becomes the default, this requires to implement and maintain a `userData` bootstrapping of the worker node described above. Once it becomes the default → none.
