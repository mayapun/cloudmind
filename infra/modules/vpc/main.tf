resource "google_compute_network" "this" {
  name                    = var.name
  auto_create_subnetworks = false
}

resource "google_compute_router" "this" {
  name    = "${var.name}-router"
  region  = var.region
  network = google_compute_network.this.id
}

resource "google_compute_subnetwork" "main" {
  name          = "${var.name}-subnet"
  region        = var.region
  network       = google_compute_network.this.id
  ip_cidr_range = var.cidr
}

output "network_id" {
  value = google_compute_network.this.id
}
output "network_name" {
  value = google_compute_network.this.name
}
output "router_id" {
  value = google_compute_router.this.id
}
