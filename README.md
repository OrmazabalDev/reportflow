# ReportFlow

MVP funcional para crear reportes operativos con:

- información general
- hallazgos con imagen local
- checklist con estados
- vista previa
- exportación a PDF

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Docker + docker-compose

## Modelo

- `Report`
- `Finding`
- `ChecklistItem`

La estructura está preparada para migrar después a PostgreSQL porque Prisma separa modelo, persistencia, storage y UI.

## Desarrollo local

1. Instala dependencias:

```bash
npm install
```

2. Genera y aplica la base local:

```bash
npm run db:migrate -- --name init
```

3. Carga datos demo opcionales:

```bash
npm run db:seed
```

4. Levanta la app:

```bash
npm run dev
```

Disponible en `http://localhost:3000`.

## Docker

Persistencia:

- SQLite en `/app/data/app.db`
- imágenes en `/app/uploads`

Levantar el MVP:

```bash
docker compose up -d --build
```

Disponible en `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:migrate -- --name init
npm run db:deploy
npm run db:seed
npm run db:studio
```

## Funcionalidad incluida

- dashboard con reportes recientes
- historial con búsqueda
- crear, editar y ver detalle de reportes
- gestión completa de hallazgos
- checklist con estados `DONE`, `PENDING`, `OBSERVED`
- uploads locales por `POST /api/uploads`
- vista previa de reporte
- exportación PDF en `/reports/:id/pdf`

## Variables de entorno

- Local: `.env` usa `file:./dev.db`
- Docker: `docker-compose.yml` usa `file:/app/data/app.db`

## Seed

El seed crea un reporte demo si la base está vacía.
