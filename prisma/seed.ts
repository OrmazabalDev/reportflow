import { ChecklistStatus, PrismaClient, ReportStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingReports = await prisma.report.count();
  if (existingReports > 0) {
    return;
  }

  await prisma.report.create({
    data: {
      title: "Reporte operativo de infraestructura tecnica",
      author: "Diego Ormazabal",
      date: new Date("2026-04-20T09:00:00.000Z"),
      description:
        "Revision programada de infraestructura tecnica para validar condiciones operativas, documentar evidencias y registrar acciones de seguimiento.",
      status: ReportStatus.FINALIZED,
      findings: {
        create: [
          {
            caption: "Tablero principal con senaletica visible",
            note:
              "El acceso se mantiene despejado y la distribucion de circuitos permite una lectura rapida para mantencion y respuesta operativa.",
            sortOrder: 0,
          },
          {
            caption: "Modulo de insumos con reposicion parcial",
            note:
              "Se detecta stock reducido en una linea secundaria. Se recomienda regularizar reposicion dentro del siguiente ciclo semanal.",
            sortOrder: 1,
          },
        ],
      },
      checklistItems: {
        create: [
          {
            text: "Area revisada visualmente",
            status: ChecklistStatus.DONE,
            sortOrder: 0,
          },
          {
            text: "Hallazgos documentados con respaldo fotografico",
            status: ChecklistStatus.DONE,
            sortOrder: 1,
          },
          {
            text: "Observaciones consolidadas para seguimiento",
            status: ChecklistStatus.OBSERVED,
            note: "Queda pendiente confirmar reposicion del modulo secundario.",
            sortOrder: 2,
          },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
