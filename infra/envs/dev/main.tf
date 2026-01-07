terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1) VPC + subnet
module "vpc" {
  source = "../../modules/vpc"

  name   = var.vpc_name
  region = var.region
  cidr   = var.subnet_cidr
}

# 2) Cloud NAT for egress (private workloads)
module "cloud_nat" {
  source = "../../modules/cloud_nat"

  name   = "${var.vpc_name}-nat"
  region = var.region

  network_id = module.vpc.network_id
  router_id  = module.vpc.router_id
}

# 3) Serverless VPC Access connector for Cloud Run → VPC
module "vpc_connector" {
  source = "../../modules/serverless_vpc_access"

  name    = "${var.vpc_name}-conn"
  region  = var.region
  network = module.vpc.network_name
  ip_cidr = var.connector_cidr
}

# 4) Cloud SQL Postgres using Private IP
module "cloud_sql" {
  source = "../../modules/cloud_sql_postgres"

  name       = var.db_name
  region     = var.region
  tier       = var.db_tier
  ha         = var.db_ha
  network_id = module.vpc.network_id
}

# 5) Cloud Run service (private ingress) with VPC connector
module "cloud_run" {
  source = "../../modules/cloud_run"

  name          = var.service_name
  region        = var.region
  image         = var.image
  min_instances = var.cr_min_instances

  vpc_connector_id = module.vpc_connector.connector_id
  ingress          = "INGRESS_TRAFFIC_INTERNAL_ONLY"
}
