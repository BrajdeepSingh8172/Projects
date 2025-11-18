# Java Maven Webapp — Jenkins, Maven, Tomcat & Docker Guide

This document explains how to set up the environment, push the project to Git/GitHub, and use Jenkins to build the WAR, create a Docker image containing Tomcat+WAR, and deploy the container automatically on each commit.

1) Prepare the repo and push to GitHub

```powershell
cd 'c:\Users\BrajDeep Singh\OneDrive\Desktop\Project\wordCount-WebApplication\java-maven-webapp'
git init
git add .
git commit -m "Initial Java Maven webapp"
# create repo on GitHub (via web UI or gh cli) and then:
git remote add origin https://github.com/<your-user>/<repo>.git
git branch -M main
git push -u origin main
```

2) Option A — Quick Jenkins with Docker (recommended for local testing)

- Run Jenkins in Docker (recommended):

```powershell
# Create directories for Jenkins home
mkdir C:\jenkins_home
docker run -d --name jenkins -p 8081:8080 -p 50000:50000 -v C:\jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

- Access Jenkins at `http://localhost:8081` and complete the initial setup (install recommended plugins). Install the 'Docker' and 'Pipeline' plugins as needed.

3) Configure tools inside Jenkins

- You don't need to install Maven and Docker on the Jenkins host if you use Docker to run builds (the provided `Jenkinsfile` runs `mvn` and `docker` commands — when running Jenkins in Docker you need to enable Docker socket or run Docker-in-Docker). For simplicity, run Jenkins on the same machine where Docker is available and grant it access to Docker socket (bind-mount `/var/run/docker.sock` on Linux). On Windows, prefer running Jenkins in a VM or use Docker Desktop.

4) Create a Pipeline job

- Create a new `Pipeline` job in Jenkins and point it to your repository (GitHub). Use `Jenkinsfile` from repo.

5) Pipeline behavior

- Checkout code
- Build WAR with Maven: `mvn -B -DskipTests clean package`
- Build Docker image using `Dockerfile` (Tomcat + WAR)
- Deploy container on host by running the built image on port `8080`

6) Notes and security

- For production, push images to a registry (Docker Hub, GHCR) and have the deployment hosts pull images rather than building on Jenkins master.
- Use Jenkins credentials to store Docker registry credentials and use `withCredentials` in the `Jenkinsfile` to login before push.
- Consider using dedicated Jenkins agents (Linux) with Docker and Maven preinstalled.

7) Alternative: use Apache Tomcat directly (no Docker)

- You can deploy the generated `target/*.war` directly to a Tomcat instance. For automated deployment, configure Jenkins to copy the WAR to the Tomcat `webapps/` directory (via SSH/WinRM) or use the Tomcat Manager plugin.
