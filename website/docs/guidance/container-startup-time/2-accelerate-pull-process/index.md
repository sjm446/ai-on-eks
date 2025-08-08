---
sidebar_label: Accelerating pull process
---

# Accelerating pull process


The solutions in this section reduce the container startup time by improving the image pull process. They do it by either relying on the images’ layered internal structure and changing how their layers are retrieved over the network from a container registry or by skipping the registry altogether.

Container images are composed of layers, implemented by content-addressable blobs, stored in registries like Amazon ECR. When a pod is scheduled onto a worker node, the container runtime, typically `containerd`, retrieves and mounts these read-only layers using a union file-system, such as [OverlayFS](https://en.wikipedia.org/wiki/OverlayFS), then attaches a writable, ephemeral layer on top to complete the container filesystem.

`containerd` is implemented as a modular container runtime with several pluggable components. A snapshotter,  which is the focus of the first two solutions, is a pluggable component that is responsible for the assembly of the image layers. The default OverlayFS snapshotter fully unpacks image layers to disk before container start and does not support lazy or partial layer extraction. Only after all layers are unpacked and mounted via OverlayFS can the container’s unified filesystem be presented.

The last step of the process described above is  blocking and sequential, and thus has a very significant impact on the container startup time.

Instead of fully extracting each layer to disk, advanced snapshotters, such as SOCI (Seekable OCI) or Nydus, create virtual, mountable snapshots, lazy-loading files from a registry or a remote storage as they are accessed, which has a lower I/O overhead and drastically improves container startup time.

Instead of improving the pull process by optimizing container image layers retrieval and storage, the last solution prefetches all the image layers onto a data volume, into the container runtime cache, of a Bottlerocket EC2 machine during a CI/CD process. The process then takes a snapshot of the volume to be mounted onto EKS Bottlerocket worker nodes, creating a warmed-up cached for the container runtime on them.
