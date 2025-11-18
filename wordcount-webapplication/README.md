# Word Count Web Application — End-to-End DevOps Deployment

This repository contains a minimal Word Count web application and the DevOps artifacts to build, containerize, CI, and deploy it to Kubernetes.

Files added:

- `server.js` — Express server to serve static files and `/health` endpoint.
- `public/index.html`, `public/styles.css` — Frontend UI to enter text and count words client-side.
- `Dockerfile`, `.dockerignore` — Containerization.
- `docker-compose.yml` — Local development using Docker Compose.
- `.github/workflows/ci.yml` — GitHub Actions workflow that builds and pushes a Docker image to GitHub Container Registry (GHCR).
- `k8s/deployment.yaml`, `k8s/service.yaml` — Kubernetes manifests for deployment and service.

Local run

1. Install dependencies locally:

```powershell
npm install
npm start
```

2. Open `http://localhost:3000`.

With Docker

1. Build image locally:

```powershell
docker build -t wordcount:local .
docker run -p 3000:3000 wordcount:local
```

2. Or with Docker Compose:

```powershell
docker-compose up --build
```

CI / Image registry

- The included GitHub Actions workflow builds and pushes the image to GHCR using the repository context: `ghcr.io/${{ github.repository }}:latest`.
- The workflow uses `secrets.GITHUB_TOKEN` (provided by GitHub Actions) to authenticate to GHCR. No extra secrets are required for GHCR in the common configuration, but if you prefer Docker Hub or another registry, update the workflow and add the required secrets.

Kubernetes deployment

1. Edit `k8s/deployment.yaml` and replace the placeholder `ghcr.io/<OWNER>/<REPO>:latest` with your built image path (for example `ghcr.io/youruser/wordCount-WebApplication:latest`).

2. Apply manifests:

```powershell
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

3. Wait for the `LoadBalancer` external IP (or use `kubectl port-forward` for local clusters):

```powershell
kubectl get svc wordcount-service -w
```

Notes & next steps

- For production, set up an image tag strategy (use commit SHA or semantic tags) and update the workflow to push semantic tags.
- Add a smoke test step in CI that runs the container and performs a quick `curl` to `/health`.
- Consider adding a Helm chart for parameterized deployments and easier upgrades.
- If deploying to a cloud-managed Kubernetes (AKS/EKS/GKE), follow provider-specific load balancer and ingress setup.

Canary / Blue‑Green deployments

- CI now pushes both `latest` and a SHA tag: `ghcr.io/${{ github.repository }}:${{ github.sha }}`. Use the SHA-tagged images for controlled rollouts.

- Argo Rollouts (Canary):
	- Apply `k8s/rollout-canary.yaml` after replacing the image placeholder with the SHA-tag (example: `ghcr.io/OWNER/REPO:${{ github.sha }}`).
	- Ensure the Argo Rollouts controller is installed in your cluster (see https://argoproj.github.io/argo-rollouts/).
	- Use `kubectl argo rollouts get rollout wordcount-rollout` and `kubectl argo rollouts promote wordcount-rollout` to manage promotion.

- Blue‑Green: `k8s/blue-green.yaml` contains two Deployments (`wordcount-blue`, `wordcount-green`) and a `wordcount-bluegreen-service` that selects pods labeled `active: "true"`.
	- Initially `wordcount-blue` is marked `active:true`. After deploying and validating `wordcount-green`, switch traffic with:

```powershell
kubectl label deployment wordcount-blue active=false --overwrite
kubectl label deployment wordcount-green active=true --overwrite
```

	- Replace image placeholders with the SHA-tagged image before applying manifests.

Safety notes

- Always prefer deploying the SHA-tag image created by CI to ensure immutability during rollouts.
- For automated canary analysis, integrate a metrics provider (Prometheus) with Argo Rollouts or add health checks in CI.

