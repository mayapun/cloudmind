resource "google_cloud_run_v2_service" "this" {
  name     = var.name
  location = var.region

  ingress = var.ingress

  template {
    scaling {
      min_instance_count = var.min_instances
    }

    containers {
      image = var.image
    }

    vpc_access {
      connector = var.vpc_connector_id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }
}

output "service_name" {
  value = google_cloud_run_v2_service.this.name
}
