variable "aws_region" {
  description = "AWS region used for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "cloudcart"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "cloudcart-eks"
}
