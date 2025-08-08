---
sidebar_label: Reducing container image size
---

# Reducing container image size

Image compressed size – the size it occupies in the container image registry, directly correlates with pull time, while image uncompressed size – the size of the image once downloaded, impacts the time it takes to bootstrap the container – the larger the size the longer it takes to decompress and extract the image layers, mount them, and combine them into the container file system.

While there are other contributing factors, like number of image layers, their structure, deduplication and container runtime cache efficiency, or registry proximity, paying special attention to size optimization is an important step on the road to reducing startup latency.

As described in [AWS Container Build lens](https://docs.aws.amazon.com/wellarchitected/latest/container-build-lens/container-build-lens.html), traditional optimization techniques, such as multi-stage builds and layer structuring that benefits loading and caching, provide foundational improvements to container image size and [overall performance and cost efficiency](https://docs.aws.amazon.com/wellarchitected/latest/container-build-lens/cost-effective-resources.html), regardless of application type. For AI/ML inference application container images, decoupling large components often yields an additional significant size reduction, since these components, particularly model artifacts and serving frameworks, often exceed several gigabytes (GB) in size.

The solutions in this section focus on both traditional optimization techniques and architectural patterns that extract these large components from the container image to a different delivery system, like Amazon S3 or Amazon FSx.

Note that the relocated components must still be made available to the application, requiring any new delivery system to be faster than the image pull process. The subsequent [Accelerating pull process](../2-accelerate-pull-process/index.md) section addresses how to optimize the retrieval of container images.
