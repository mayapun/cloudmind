variable "project_id" { type = string }
variable "region" { type = string }

variable "vpc_name" { type = string }
variable "subnet_cidr" { type = string }

variable "connector_cidr" { type = string }

variable "db_name" { type = string }
variable "db_tier" { type = string }
variable "db_ha" { type = bool }

variable "service_name" { type = string }
variable "image" { type = string }
variable "cr_min_instances" { type = number }
