## user-service + audit-service

Два сервиса: user-service (HTTP API + аудит действий через gRPC) и audit-service (gRPC сервер + HTTP для просмотра логов). У каждого свой Postgres. Миграции — `sequelize-cli`.

### Быстрый старт локально (без Docker)

1. Установить зависимости: `npm install`.
2. Скопировать `.env` из `apps/*/.env.example` и настроить (порты БД, API_KEY, AUDIT_SERVICE_URL и т.д.).
3. Применить миграции:
   - `npm run migrate:user`
   - `npm run migrate:audit`
4. Запустить сервисы:
   - `npm run start:user-service` (HTTP 3000, Swagger `/docs`, health `/health/live`, `/health/ready`)
   - `npm run start:audit-service` (HTTP 3001, gRPC 50051, HTTP `/audit/logs`)
5. Документация (Swagger):
   - user-service: `http://localhost:3000/docs` (public)

### Запуск в Docker

1. Собрать и поднять всё:  
   `docker compose up --build` (или `-d` для фона).
2. Запустить выборочно:  
   `docker compose up --build user-service postgres-user`  
   `docker compose up --build audit-service postgres-audit`
3. Остановить: `docker compose down` (или `stop` для остановки без удаления).

### Конфигурация

- user-service: порты 3000, подключение к Postgres (`DB_*`), аудит — `AUDIT_SERVICE_URL` (в Docker: `audit-service:50051`), API-ключ в `X-API-Key` (кроме `/health`, `/docs`).
- audit-service: порты 3001 (HTTP) и 50051 (gRPC), БД отдельная.
- gRPC proto: `libs/proto/src/audit.proto` (копируется в сборку).

### Полезное

- Пагинация/фильтры пользователей: `page/limit`, сортировка `sort_by/sort_dir`, фильтры `name/email`, `created_from/to`.
- Аудит CRUD пишется в `audit_logs`, лог `/audit/logs` с пагинацией и фильтрами.
- Soft delete включён (`paranoid`), удалённые пользователи не возвращаются.
- Rate limit включён глобально (Throttler), API-key guard глобальный, health публичный. Swagger открыт.
