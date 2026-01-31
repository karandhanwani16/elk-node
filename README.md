# ELK Stack Demo – Node.js App

A small Express app with **3 endpoints** and **3 log formats** written to files, suitable for demonstrating the ELK stack (Elasticsearch, Logstash, Kibana).

## Endpoints

| Method | Path     | Description                    |
|--------|----------|--------------------------------|
| GET    | `/health` | Health check (info logs)       |
| GET    | `/users`  | List users, optional `?limit=N` (info logs) |
| POST   | `/events` | Create event, JSON body (warn logs) |

## Log formats (in `./logs/`)

1. **JSON** – `logs/app.json.log`  
   One JSON object per line. Ideal for Elasticsearch (structured fields, easy to index).

2. **Plain text** – `logs/app.log`  
   Human-readable lines: `[timestamp] [LEVEL] message {meta}`.

3. **Key=value** – `logs/access.log`  
   Space-separated key=value pairs. Good for Logstash key-value parsing and access-style analysis.

## Run

```bash
npm install
npm start
```

Then call the endpoints to generate logs:

```bash
curl http://localhost:3000/health
curl "http://localhost:3000/users?limit=2"
curl -X POST http://localhost:3000/events -H "Content-Type: application/json" -d '{"type":"signup","userId":1}'
```

Check `./logs/` for `app.json.log`, `app.log`, and `access.log`. Use Filebeat or Logstash to ship these into Elasticsearch and visualize in Kibana.
