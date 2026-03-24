.PHONY: help dev-up dev-down dev-logs dev-ps dev-restart prod-up prod-down prod-logs prod-ps obs-up obs-down obs-logs all-up all-down

COMPOSE_BASE = docker compose -f docker-compose.yml
COMPOSE_DEV = $(COMPOSE_BASE) -f docker-compose.dev.yml --profile dev
COMPOSE_PROD = $(COMPOSE_BASE) -f docker-compose.prod.yml --profile prod
COMPOSE_PROD_OBS = $(COMPOSE_BASE) -f docker-compose.prod.yml --profile prod --profile obs
COMPOSE_OBS = docker compose --profile obs

help:
	@echo "Alvos disponiveis:"
	@echo "  make dev-up        # sobe ambiente de desenvolvimento (API + DB + Kafka)"
	@echo "  make dev-down      # derruba ambiente de desenvolvimento"
	@echo "  make dev-logs      # acompanha logs da API dev"
	@echo "  make dev-ps        # lista status dos containers dev"
	@echo "  make dev-restart   # reinicia apenas a API dev"
	@echo "  make prod-up       # sobe ambiente de producao (API + DB) com build"
	@echo "  make prod-down     # derruba ambiente de producao"
	@echo "  make prod-logs     # acompanha logs da API prod"
	@echo "  make prod-ps       # lista status dos containers prod"
	@echo "  make obs-up        # sobe stack de observabilidade (Loki/Promtail/Grafana)"
	@echo "  make obs-down      # derruba stack de observabilidade"
	@echo "  make obs-logs      # acompanha logs da stack observabilidade"
	@echo "  make all-up        # sobe producao + observabilidade"
	@echo "  make all-down      # derruba producao + observabilidade"

dev-up:
	$(COMPOSE_DEV) up -d

dev-down:
	$(COMPOSE_DEV) down

dev-logs:
	$(COMPOSE_DEV) logs -f api_dev

dev-ps:
	$(COMPOSE_DEV) ps

dev-restart:
	$(COMPOSE_DEV) restart api_dev

prod-up:
	$(COMPOSE_PROD) up -d --build

prod-down:
	$(COMPOSE_PROD) down

prod-logs:
	$(COMPOSE_PROD) logs -f api

prod-ps:
	$(COMPOSE_PROD) ps

obs-up:
	$(COMPOSE_OBS) up -d

obs-down:
	$(COMPOSE_OBS) down

obs-logs:
	$(COMPOSE_OBS) logs -f

all-up:
	$(COMPOSE_PROD_OBS) up -d --build

all-down:
	$(COMPOSE_PROD_OBS) down
