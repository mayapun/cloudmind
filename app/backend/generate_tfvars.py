from typing import Dict, Any

def tf_bool(v: bool) -> str:
    return "true" if v else "false"

def render_tfvars(spec: Dict[str, Any], settings: Dict[str, Any]) -> str:
    # You can keep these simple for v0:
    project_id = spec.get("project_id", "YOUR_PROJECT_ID")  # optional
    region = spec["region"]

    # Map planner settings to tfvars
    cr_min = settings["cloud_run"]["min_instances"]
    db = settings["sql"]

    lines = []
    lines.append(f'project_id = "{project_id}"')
    lines.append(f'region     = "{region}"')
    lines.append("")
    lines.append('vpc_name    = "cloudmind-p1"')
    lines.append('subnet_cidr = "10.10.0.0/24"')
    lines.append('connector_cidr = "10.8.0.0/28"')
    lines.append("")
    lines.append(f'db_name = "cloudmind-db"')
    lines.append(f'db_tier = "{db["tier"]}"')
    lines.append(f'db_ha   = {tf_bool(db["ha"])}')
    lines.append("")
    lines.append('service_name     = "cloudmind-api"')
    lines.append('image            = "us-docker.pkg.dev/cloudrun/container/hello"')
    lines.append(f'cr_min_instances = {cr_min}')
    lines.append("")

    return "\n".join(lines)
