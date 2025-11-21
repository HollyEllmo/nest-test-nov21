# Тестовое задание — NestJS Микросервисы

Разработать два микросервиса на NestJS, взаимодействующих через gRPC. Основной сервис управляет пользователями, вспомогательный — фиксирует аудит‑действия в базе данных.

## Общие требования

- **Фреймворк:** NestJS  
- **ORM:** Sequelize  
- **База данных:** PostgreSQL (отдельные подключения для каждого сервиса)  
- **Связь между сервисами:** gRPC (@nestjs/microservices)  
- **Конфигурация:** через `.env`

### Требования к сервисам

- Разделение слоёв: контроллеры, сервисы, DTO, модели  
- Корректная настройка Sequelize и миграций  
- Реализация gRPC‑схем через `.proto` файл  
- Валидация DTO через `class-validator`  
- Имплементировать кастомный декоратор `@CorrelationId()`:
  - извлекает `X-Request-Id` из заголовка (или генерирует новый)
  - пробрасывает его в лог и в gRPC‑метаданные  
- Обработка ошибок  
- Чистая и читаемая структура проекта  

---

## Сервис A — User Service

- **HTTP API:** порт 3000  
- **Подключение:** PostgreSQL  

### Операции с сущностью `пользователь`:

- создание  
- получение  
- список пользователей с:
  - пагинацией  
  - фильтрацией  
  - сортировкой  
  - query‑параметры:
    - `page`
    - `limit`
    - `sort_by` (name | email | created_at)
    - `sort_dir` (asc | desc)
    - фильтры: `name ilike`, `email ilike`, `created_from`, `created_to`
- обновление  
- мягкое удаление (soft delete)

### Поведение

- После каждого действия отправлять событие в Audit Service по gRPC  
- Soft‑deleted пользователи не участвуют в выборках  
- Rate limit на публичные эндпоинты (например, 120 rps на IP в минуту)

### Безопасность

- Простая API‑key аутентификация через заголовок `X-API-Key` (опционально)

### Health endpoints

- `/health/live`
- `/health/ready`
  - проверяет соединение с БД
  - проверяет доступность Audit Service через gRPC ping

---

## Сервис B — Audit Service

- gRPC‑сервер (порт 50051)
- Принимает события от сервиса A через gRPC
- Записывает каждое событие в таблицу `audit_logs` (PostgreSQL)
- Имеет read‑only HTTP эндпоинт `/audit/logs` для отладки:
  - пагинация  
  - фильтры: `entity_type`, `action`, `timestamp range`

---

## Структуры данных

### User

- `id`: UUID  
- `name`: string  
- `email`: string (уникальный)  
- `created_at`: timestamp  
- `updated_at`: timestamp  
- `deleted_at`: timestamp | null  

### AuditLog

- `id`: UUID  
- `action`: string (enum), пример:  
  ```ts
  enum AuditLogAction {
    UserCreated = 'user_created'
  }
  ```
- `entity_type`: smallint (enum), пример:  
  ```ts
  enum AuditLogEntityType {
    User = 1
  }
  ```
- `entity_id`: string  
- `request_id`: uuid  
- `timestamp`: datetime (время действия от сервиса A)  
- `created_at`: timestamp  
- `updated_at`: timestamp  
