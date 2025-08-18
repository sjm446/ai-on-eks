# Inference ready Amazon EKS Cluster

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Architecture Steps](#architecture-steps)
- [Plan Your Deployment](#plan-your-deployment)
    - [AWS Services in this Guidance](#aws-services-in-this-guidance)
    - [Cost](#cost)
    - [Sample Cost Table](#sample-cost-table)
- [Security](#security)
- [Quick Start Guide](#quick-start-guide)
    - [Important Setup Instructions](#-important-setup-instructions)
    - [Deploy the Infrastructure](#deploy-the-infrastructure)
    - [Deploying Models](#deploying-models)
        - [Prerequisites](#prerequisites)
        - [Create a Hugging Face Token](#how-to-create-a-hugging-face-token)
        - [Create a Cluster Secret](#create-the-cluster-secret)
        - [Deploy the Model](#deploy-a-model)
- [Monitoring and Observability](#-monitoring-and-observability)
- [Cleanup](#cleanup-the-environment)
- [License](#license)

## Overview

This solution implements a comprehensive, scalable ML inference architecture using Amazon EKS, leveraging both AWS
Neuron processors for cost-effective, accelerated inference, and GPU instances for traditional inference. The system
provides a complete end-to-end platform for deploying large language models and generative AI capabilities along with
observability support.

## Architecture

The architecture diagram illustrates our scalable ML inference solution with the following components:

- **Amazon EKS Cluster**: The foundation of our architecture, providing a managed Kubernetes environment with automated
  provisioning and configuration.

- **Karpenter Auto-scaling**: Dynamically provisions and scales compute resources based on workload demands across
  multiple node pools.

- **Node Pools**:
    - **Neuron-based nodes**: Cost-effective Neuron inference using inf2/trn1 instances
    - **GPU-based nodes**: High-performance inference using NVIDIA GPU instances (g5, g6 families)
    - **x86-based nodes**: General purpose compute for compatibility requirements

- **Model Hosting Services**:
    - **Ray Serve**: Distributed model serving with automatic scaling
    - **Standalone Services**: Direct model deployment for specific use cases
    - **Multi-modal Support**: Text, vision, and reasoning model capabilities
    - **AIBrix**: Distributed KV Caching for resource sharing
    - **LWS**: Multinode distributed inference for very large models

- **Observability & Monitoring**:
    - **Prometheus & Grafana**: Infrastructure monitoring and alerting
    - **Dashboards**: Built-in AI/ML workload specific dashboards

This architecture provides flexibility to choose between cost-optimized inference on Neuron processors or
high-throughput GPU inference based on your specific requirements, all while maintaining elastic scalability through
Kubernetes and Karpenter.

![Architecture Diagram](image/architecture.png)

## Architecture Steps

1) DevOps engineer defines a per-environment Terraform [variable file](terraform/blueprint.tfvars) that controls the
   environment-specific
   configuration.
2) DevOps engineer applies the environment configuration using Terraform following the deployment process defined in the
   guidance.
3) An [Amazon Virtual Private Network (VPC)](https://aws.amazon.com/vpc/) is provisioned and configured based on
   specified configuration. According to best practices for Reliability, 4 Availability zones (AZs) are configured to
   provide the best chance of node acquisition and high availability. Topology awareness defaults to keep AI/ML
   workloads in the same AZ for performance/cost, but is configurable for availability.
4) [Amazon Elastic Kubernetes Service (EKS)](https://aws.amazon.com/eks/) cluster is provisioned with Managed Nodes
   Group that run critical cluster add-ons (CoreDNS, AWS Load Balancer Controller
   and [Karpenter](https://karpenter.sh/)) on its compute node instances. Karpenter will manage compute capacity to
   other add-ons, as well as inference applications that will be deployed by user while prioritizing the most
   cost-effective instances.
5) Other relevant EKS add-ons are deployed based on the configurations defined in the per-environment Terraform
   configuration file.
6) An observability stack including FluentBit and Prometheus is deployed to collect metrics and logs from the
   environment. Service and Pod Monitors are deployed to watch for AI/ML related workloads and collect metrics. Grafana
   and dashboards are deployed to automatically visualize the metrics and logs side by side.
7) Users are now able to deploy AI/ML inference workloads using the AI on EKS inference charts or others.

## Plan your deployment

### AWS services in this Guidance

| **AWS Service**                                                              | **Role**           | **Description**                                                                                             |
|------------------------------------------------------------------------------|--------------------|-------------------------------------------------------------------------------------------------------------|
| [Amazon Elastic Kubernetes Service](https://aws.amazon.com/eks/) ( EKS)      | Core service       | Manages the Kubernetes control plane and worker nodes for container orchestration.                          |
| [Amazon Elastic Compute Cloud](https://aws.amazon.com/ec2/) (EC2)            | Core service       | Provides the compute instances for EKS worker nodes and runs containerized applications.                    |
| [Amazon Virtual Private Cloud](https://aws.amazon.com/vpc/) (VPC)            | Core Service       | Creates an isolated network environment with public and private subnets across multiple Availability Zones. |
| [Amazon Elastic Container Registry](http://aws.amazon.com/ecr/) (ECR)        | Supporting service | Stores and manages Docker container images for EKS deployments.                                             |
| [Elastic Load Balancing](https://aws.amazon.com/elasticloadbalancing/) (NLB) | Supporting service | Distributes incoming traffic across multiple targets in the EKS cluster.                                    |
| [Amazon Elastic Block Store](https://aws.amazon.com/ebs) (EBS)               | Supporting service | Provides persistent block storage volumes for EC2 instances in the EKS cluster.                             |
| [AWS Key Management Service](https://aws.amazon.com/kms/) (KMS)              | Security service   | Manages encryption keys for securing data in EKS and other AWS services.                                    |

### Cost

You are responsible for the cost of the AWS services used while running this guidance.
As of August 2025, the cost for running this guidance with the default settings in the US West (Oregon) Region is
approximately **$96.21/month**.

We recommend creating a [budget](https://alpha-docs-aws.amazon.com/awsaccountbilling/latest/aboutv2/budgets-create.html)
through [AWS Cost Explorer](http://aws.amazon.com/aws-cost-management/aws-cost-explorer/) to help manage costs. Prices
are subject to change. For full details, refer to the pricing webpage for each AWS service used in this guidance.

### Sample cost table

The following table provides a sample cost breakdown for deploying this guidance with the default parameters in the
`us-west-2` (Oregon) Region for one month. This estimate is based on the AWS Pricing Calculator output for the full
deployment as per the guidance. This **does not** factor any model deployments on top of the running environment.

| **AWS service**                  | Dimensions                        | Cost, month [USD] |
|----------------------------------|-----------------------------------|-------------------|
| Amazon EKS                       | 1 cluster                         | $73.00            |
| Amazon VPC                       | 1 NAT Gateways                    | $33.75            |
| Amazon EC2                       | 2 m5.large instances              | $156.16           |
| Amazon EBS                       | gp3 storage volumes and snapshots | $7.20             |
| Elastic Load Balancer            | 1 NLB for workloads               | $16.46            |
| Amazon VPC                       | Public IP addresses               | $3.65             |
| AWS Key Management Service (KMS) | Keys and requests                 | $6.00             |
| **TOTAL**                        |                                   | **$296.21/month** |

For a more accurate estimate based on your specific configuration and usage patterns, we recommend using
the [AWS Pricing Calculator](https://calculator.aws).

## Security

When you build systems on AWS infrastructure, security responsibilities are shared between you and AWS.
This [shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/) reduces your
operational burden because AWS operates, manages, and controls the components including the host operating system, the
virtualization layer, and the physical security of the facilities in which the services operate. For more information
about AWS security, visit [AWS Cloud Security](http://aws.amazon.com/security/).

This guidance implements several security best practices and AWS services to enhance the security posture of your EKS
Workload Ready Cluster. Here are the key security components and considerations:

### Identity and Access Management (IAM)

- **EKS Managed Node Groups**: These use IAM roles with specific permissions required for nodes to join the cluster and
  for pods to access AWS services.

### Network Security

- **Amazon VPC**: The EKS cluster is deployed within a custom VPC with public and private subnets across multiple
  Availability Zones, providing network isolation.
- **Security Groups**: Although not explicitly shown in the diagram, security groups are typically used to control
  inbound and outbound traffic to EC2 instances and other resources within the VPC.
- **NAT Gateways**: Deployed in public subnets to allow outbound internet access for resources in private subnets while
  preventing inbound access from the internet.

### Data Protection

- **Amazon EBS Encryption**: EBS volumes used by EC2 instances are typically encrypted to protect data at rest.
- **AWS Key Management Service (KMS)**: Used for managing encryption keys for various services, including EBS volume
  encryption.

### Kubernetes-specific Security

- **Kubernetes RBAC**: Role-Based Access Control is implemented within the EKS cluster to manage fine-grained access to
  Kubernetes resources.

### Secrets Management

- **AWS Secrets Manager**: While not explicitly shown in the diagram, it's commonly used to securely store and manage
  sensitive information such as database credentials, API keys, and other secrets used by applications running on EKS.

### Additional Security Considerations

- Regularly update and patch EKS clusters, worker nodes, and container images.
- Implement network policies to control pod-to-pod communication within the cluster.
- Use Pod Security Policies or Pod Security Standards to enforce security best practices for pods.
- Implement proper logging and auditing mechanisms for both AWS and Kubernetes resources.
- Regularly review and rotate IAM and Kubernetes RBAC permissions.

## Quick Start Guide

The solution comes in two parts:

- The infrastructure for running inference workloads (this)
- The models that can be deployed on top of a running environment (
  the [inference charts](../../../blueprints/inference/inference-charts))

### ⚠️ Important Setup Instructions

**Before proceeding with this solution, ensure you have:**

- **AWS CLI configured** with appropriate permissions for EKS, ECR, CloudFormation, and other AWS services
- **kubectl installed** and configured to access your target AWS region
- **Sufficient AWS service quotas** - This solution requires multiple EC2 instances, EKS cluster, and other AWS
  resources

**Recommended Setup Verification:**

```bash
# Verify AWS CLI access
aws sts get-caller-identity

# Verify kubectl installation
kubectl version --client

# Check available AWS regions and quotas
aws ec2 describe-regions
aws service-quotas get-service-quota --service-code ec2 --quota-code L-1216C47A
```

**Cost Awareness:** This solution will incur AWS charges. Review the cost breakdown section below and set up billing
alerts before deployment.

### Deploy the Infrastructure

The following is a quick way to deploy the infrastructure. It will create everything and return the command to configure
`kubectl` for this cluster. Note, it will take about 15 minutes to run.

```bash
git clone https://github.com/awslabs/ai-on-eks.git
cd ai-on-eks
cd infra/solutions/inference-ready-cluster
./install.sh
```

### Deploying models

#### Prerequisites

- EKS cluster set up following the steps above
- `kubectl` configured to access your cluster
- a Hugging Face Token
- a configured secret from the Hugging Face Token

#### How to create a Hugging Face Token

To access Hugging Face models, you'll need to create an access token:

1. **Sign up or log in** to [Hugging Face](https://huggingface.co/)
2. **Navigate to Settings**: Click on your profile picture in the top right corner and select "Settings"
3. **Access Tokens**: In the left sidebar, click on "Access Tokens"
4. **Create New Token**: Click "New token" button
5. **Configure Token**:
    - **Name**: Give your token a descriptive name (e.g., "EKS-ML-Inference")
    - **Type**: Select "Read" for most use cases (allows downloading models)
    - **Repositories**: Leave empty to access all public repositories, or specify particular ones
6. **Generate Token**: Click "Generate a token"
7. **Copy and Store**: Copy the generated token immediately and store it securely

**Important Notes**:

- Keep your token secure and never share it publicly
- You can revoke tokens at any time from the same settings page
- For production environments, consider using organization tokens with appropriate permissions
- Some models may require additional permissions or agreements before access

#### Create the cluster secret

Replace `your_huggingface_token` with the token from the previous step

```bash
kubectl create secret generic hf-token --from-literal=token=your_huggingface_token
```

#### Deploy a model

This step assumes you're at the root of the ai-on-eks folder. The following will deploy a Llama 3.2 1B model on a GPU
node.

```bash
cd blueprints/inference/inference-charts
helm tempalte . --values values-llama-32-1b-vllm.yaml
```

Please take a look at all the different deployment options in
the [inference charts readme](../../../blueprints/inference/inference-charts/README.md).

### 📊 Monitoring and Observability

The solution includes comprehensive observability features:

- **Prometheus Integration**: Enables automated metric collection of system and AI workloads.
- **Fluent Bit Log Aggregation**: Automates log collection for system and AI workloads.
- **OpenSearch Log Backend**: Robust, 3 replica stateful log storage
- **Grafana Dashboards**: Out of the box dashboards for aggregating logs and metrics for AI inference
- **Alertmanager**: Supports automated alerting on metrics

#### Connect

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

You can now visit http://localhost:3000 and log in with username: `admin`, password: `prom-operator` to access Grafana.

The solution includes an inference dashboard
available [here](http://localhost:3000/d/bec31e71-3ac5-4133-b2e3-b9f75c8ab56c/inference-dashboard?orgId=1&refresh=5s).

## Cleanup the Environment

When you are done using the environment, you can delete all its resources by running the following command (assuming the
root of the git repository):

```bash
cd infra/solutions/inference-ready-cluster/terraform/_LOCAL
./cleanup.sh
```

This cleanup script will remove the EKS environment and VPC and anything contained in the VPC that was created by the
installation script. Note, it will not remove anything that was created in S3 or stored outside the components that were
directly created by the deployment. You will need to remove them yourself to not incur any further potential costs.

## License
This solution is licensed under the Apache-2.0 License, please find the [License here](../../../LICENSE)
