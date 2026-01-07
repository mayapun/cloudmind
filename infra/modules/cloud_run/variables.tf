variable "name" { type = string }
variable "region" { type = string }
variable "image" { type = string }
variable "min_instances" { type = number }
variable "vpc_connector_id" { type = string }
variable "ingress" {
  type    = string
  default = "INGRESS_TRAFFIC_INTERNAL_ONLY"
}
