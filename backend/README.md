# comsys-backend — Лабораторна робота №1

Бекенд на NestJS для кіберфізичної системи моніторингу давачів (температура,
вологість). Реалізує CRUD REST API відповідно до завдання лабораторної
роботи №1 курсу "Теорія і проектування комп'ютерних та кіберфізичних систем
і мереж".

## Встановлення та запуск

```bash
npm install
npm run start:dev
```

Сервер піднімається на `http://localhost:3000`.

## Реалізовані сутності

### Датчик температури — `/sensors`

| Метод  | Шлях          | Опис                          |
| ------ | ------------- | ------------------------------ |
| GET    | `/`           | Перевірка роботи сервера ("Hello World!") |
| POST   | `/sensors`    | Створити запис давача          |
| GET    | `/sensors`    | Отримати список усіх давачів   |
| GET    | `/sensors/:id`| Отримати давач за id           |
| PATCH  | `/sensors/:id`| Оновити давач за id            |
| DELETE | `/sensors/:id`| Видалити давач за id           |

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

## Валідація

Обидві сутності використовують DTO (`class-validator` + `class-transformer`)
з увімкненим глобальним `ValidationPipe` (`whitelist: true, transform: true`)
у [src/main.ts](src/main.ts). Поля `sensorName`, `value`, `unit` є
обов'язковими; `timestamp` — опційне і проставляється сервером автоматично.

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
  temperature-sensors/
    dto/
    entities/
    temperature-sensors.controller.ts
    temperature-sensors.service.ts
    temperature-sensors.module.ts
  humidity-sensors/
    dto/
    entities/
    humidity-sensors.controller.ts
    humidity-sensors.service.ts
    humidity-sensors.module.ts
```

Дані зберігаються in-memory (у масиві всередині сервісу) — це відповідає
обсягу лабораторної роботи №1; персистентне сховище планується додати в
наступних лабораторних роботах разом із фронтендом для відображення
показників температури.
