terraform {
  backend "s3" {
    bucket       = "cloudcart-tfstate-766696030212-us-east-1"
    key          = "cloudcart/eks/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
