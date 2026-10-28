# comsys-backend

Бекенд на NestJS для кіберфізичної системи моніторингу давачів (температура,
вологість). Реалізація CRUD REST API з зберіганням даних у PostgreSQL
(TypeORM, хмарна БД на платформі Render).

## Встановлення та запуск

```bash
npm install
cp .env.example .env   # та заповнити параметри підключення до БД
npm run start:dev
```

Сервер піднімається на `http://localhost:3000`.

## Налаштування бази даних (PostgreSQL)

Параметри підключення беруться зі змінних середовища (локально — з файлу
`.env`, який ігнорується git; на Render — з розділу Environment вебсервісу).
Значення знаходяться в Configuration Options сервісу Postgres на Render
(для локального запуску використовується **External** Database URL/хост,
для вебсервісу на Render — Internal).

| Змінна         | Опис                                                              |
| -------------- | ----------------------------------------------------------------- |
| `DB_HOST`      | Хост БД                                                           |
| `DB_PORT`      | Порт (за замовчуванням `5432`)                                    |
| `DB_USERNAME`  | Ім'я користувача                                                  |
| `DB_PASSWORD`  | Пароль                                                            |
| `DB_NAME`      | Назва БД                                                          |
| `DB_SSL`       | `true` (за замовчуванням) для Render; `false` для локального PG   |
| `FRONTEND_URL` | Дозволений CORS-origin (необов'язково, за замовчуванням `*`)      |

Схема БД **не** синхронізується автоматично (`synchronize: false`). Таблиці
`temperature-sensors` і `humidity-sensors` створює TypeORM-міграція
[src/migrations](src/migrations), яка виконується автоматично при старті
застосунку (`migrationsRun: true`). Зміни схеми потрібно додавати новими
міграціями.

Тест `npm run test:e2e` піднімає весь застосунок, тому потребує доступної БД
(ті самі змінні середовища).

## Реалізовані сутності

### Датчик температури — `/sensors`

| Метод  | Шлях           | Опис                                      |
| ------ | -------------- | ----------------------------------------- |
| GET    | `/`            | Перевірка роботи сервера ("Hello World!") |
| POST   | `/sensors`     | Створити запис давача                     |
| GET    | `/sensors`     | Отримати список усіх давачів              |
| GET    | `/sensors/:id` | Отримати давач за id                      |
| PATCH  | `/sensors/:id` | Оновити давач за id                       |
| DELETE | `/sensors/:id` | Видалити давач за id                      |

Тіло запиту (POST/PATCH):

```json
{
  "sensorName": "Temp",
  "value": 27,
  "unit": "C"
}
```

### Датчик вологості — `/humidity-sensors`

Аналогічний набір операцій (POST / GET / GET :id / PATCH / DELETE) за
адресою `/humidity-sensors`. Ця сутність додана як розширення функціоналу
відповідно до завдання лабораторної роботи.

```json
{
  "sensorName": "Humid-1",
  "value": 55,
  "unit": "%"
}
```

## Сповіщення про критичну температуру (SSE)

`GET /alerts/stream` — потік Server-Sent Events (`text/event-stream`).
Коли температурний давач (`POST /sensors` або `PATCH /sensors/:id` зі зміною
`value`) повідомляє значення **нижче -10** (`CRITICAL_TEMPERATURE_C` у
[src/alerts/alerts.service.ts](src/alerts/alerts.service.ts)), усім підключеним
клієнтам надсилається подія `critical-temperature`:

```
event: critical-temperature
data: {"sensorId":"...","sensorName":"Temp","value":-12,"unit":"C","threshold":-10,"timestamp":"...","message":"..."}
```

Кожні 25 с надсилається службова подія `ping`, щоб проксі (Render) не
закривав неактивне з'єднання. Фронтенд (`frontend/components/CriticalAlerts.tsx`)
підписується через `EventSource` і показує сповіщення користувачам на всіх
сторінках; адреса бекенду береться зі змінної `NEXT_PUBLIC_API_URL`
(за замовчуванням `http://localhost:3000`).

Перевірка: `curl -N http://localhost:3000/alerts/stream`, а в іншому терміналі
`POST /sensors` із `"value": -15`.

## Валідація

Обидві сутності використовують DTO (`class-validator` + `class-transformer`)
з увімкненим глобальним `ValidationPipe`
(`whitelist: true, forbidNonWhitelisted: true, transform: true`)
у [src/main.ts](src/main.ts). Поля `sensorName`, `value`, `unit` є
обов'язковими; `timestamp` — опційне (дата) і проставляється БД автоматично.
Параметр `:id` має бути валідним UUID (інакше — 400).

## Тестування через Postman

Колекція запитів знаходиться у [postman/comsys-backend.postman_collection.json](postman/comsys-backend.postman_collection.json).
Імпортуйте файл у Postman (`Import` → виберіть файл) — колекція міститиме
запити для базової перевірки сервера та повний CRUD для обох сутностей,
включно з прикладом невалідного запиту (перевірка валідації).

Порядок ручного тестування:

1. `CheckServerWorking` (GET `/`) — має повернути `Hello World!`.
2. `Create temperature sensor` (POST `/sensors`) — id зберігається у змінну
   колекції `tempSensorId`.
3. `Get all temperature sensors` — перевірити, що запис зʼявився.
4. `Get temperature sensor by id`, `Update temperature sensor`,
   `Create temperature sensor - invalid body` (має повернути 400).
5. `Delete temperature sensor`, потім знову `Get all temperature sensors` —
   переконатись, що список порожній.
6. Аналогічно для папки `Humidity Sensors`.

## Структура проєкту

```
src/
  app.module.ts
  main.ts
  migrations/               # TypeORM-міграції схеми БД
  temperature-sensors/
    dto/
    entities/
    temperature-sensors.controller.ts
    temperature-sensors.service.ts
    temperature-sensors.module.ts
  alerts/                   # SSE-сповіщення про критичну температуру
  humidity-sensors/
    dto/
    entities/
    humidity-sensors.controller.ts
    humidity-sensors.service.ts
    humidity-sensors.module.ts
```

Дані зберігаються у PostgreSQL. `GET /sensors` та `GET /humidity-sensors`
повертають до 50 останніх записів, відсортованих за `createdAt` (новіші
першими).
