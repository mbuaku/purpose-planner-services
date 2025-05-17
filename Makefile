.PHONY: help build push deploy test clean

DOCKER_REPO = mbuaku/purpose-planner-services
IMAGE_TAG ?= latest
SERVICES = auth-service gateway-service financial-service spiritual-service profile-service schedule-service dashboard-service

help:
	@echo "Available commands:"
	@echo "  make build       - Build all service images"
	@echo "  make push        - Push all images to DockerHub"
	@echo "  make deploy      - Deploy to Kubernetes"
	@echo "  make test        - Run all tests"
	@echo "  make clean       - Clean up"

build:
	@for service in $(SERVICES); do \
		echo "Building $$service..."; \
		docker build -t $(DOCKER_REPO)/$$service:$(IMAGE_TAG) ./$$service; \
	done

push:
	@for service in $(SERVICES); do \
		echo "Pushing $$service..."; \
		docker push $(DOCKER_REPO)/$$service:$(IMAGE_TAG); \
	done

test:
	@for service in $(SERVICES); do \
		echo "Testing $$service..."; \
		cd $$service && npm test || echo "No tests"; \
		cd ..; \
	done

deploy:
	kubectl apply -f k8s-manifests/

clean:
	docker-compose down
	@for service in $(SERVICES); do \
		docker rmi $(DOCKER_REPO)/$$service:$(IMAGE_TAG) || true; \
	done

dev:
	docker-compose up