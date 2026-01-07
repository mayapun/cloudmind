project_id = "my-gcp-project-id"
region     = "us-east4"

vpc_name    = "cloudmind-p1"
subnet_cidr = "10.10.0.0/24"
connector_cidr = "10.8.0.0/28"

db_name = "cloudmind-db"
db_tier = "db-custom-2-7680"
db_ha   = true

service_name     = "cloudmind-api"
image            = "us-docker.pkg.dev/cloudrun/container/hello"
cr_min_instances = 1
