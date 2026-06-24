import { test, expect, Page } from "@playwright/test";

// Helper to complete onboarding if visible
async function completeOnboardingIfVisible(page: Page) {
  await page.goto("/");
  const onboardingTitle = page.locator("text=Bienvenido a ReportFlow");
  try {
    await onboardingTitle.waitFor({ state: "visible", timeout: 3000 });
    await page.locator("#first-name").fill("Juan");
    await page.locator("#last-name").fill("Doe");
    await page.locator('button:has-text("Continuar")').click();
    await page.locator('button:has-text("Omitir por ahora")').click();
    await expect(onboardingTitle).not.toBeVisible();
  } catch (e) {
    // Already onboarded or timed out
  }
}

test("crear plantilla masiva, usarla en un reporte y exportar PDF", async ({ page }) => {
  // 1. Asegurar inicio sin onboarding
  await completeOnboardingIfVisible(page);

  // 2. Ir a la vista de plantillas
  await page.goto("/templates");

  // 3. Crear nueva plantilla
  const btnCrear = page.locator('button:has-text("Nueva plantilla"), button:has-text("Crear plantilla")');
  await btnCrear.click();

  await page.locator("#template-name").fill("Plantilla de Pruebas E2E");
  await page.locator("#template-desc").fill("Plantilla con ítems de prueba para verificar flujos automáticos.");

  // Carga masiva de items
  await page.locator('button:has-text("Carga masiva")').click();
  
  const bulkTextarea = page.locator('textarea[placeholder*="Verificar cableado"]');
  await bulkTextarea.fill("Revisión de Cableado Eléctrico\nVerificar Nivel de Aceite del Motor\nComprobación de Alarma de Incendios");
  
  await page.locator('button:has-text("Añadir ítems")').click();
  await page.locator('button:has-text("Guardar plantilla")').click();

  // Debe listarse la nueva plantilla
  await expect(page.locator("text=Plantilla de Pruebas E2E")).toBeVisible();
  await expect(page.locator('span:has-text("3 ítems")').first()).toBeVisible();

  // 4. Crear nuevo reporte usando la plantilla
  await page.goto("/reports/new");

  // Paso 1: Portada
  await page.locator('input[placeholder*="Revisión operativa"]').fill("Auditoría Semanal de Planta");
  await page.locator('textarea[placeholder*="Alcance, ubicación"]').fill("Inspección de rutina del pabellón B.");
  await page.locator('button:has-text("Continuar")').click();

  // Paso 2: Checklist (aplicar plantilla)
  await page.locator('button:has-text("Usar plantilla")').click();
  await page.locator('article:has-text("Plantilla de Pruebas E2E") button:has-text("Usar plantilla")').click();

  // Validar que se cargaron los 3 ítems
  await expect(page.locator("#check-text-0")).toHaveValue("Revisión de Cableado Eléctrico");
  await expect(page.locator("#check-text-1")).toHaveValue("Verificar Nivel de Aceite del Motor");
  await expect(page.locator("#check-text-2")).toHaveValue("Comprobación de Alarma de Incendios");

  // Modificar estado del primer ítem a Realizado y el segundo a Observado con nota
  await page.locator("#check-status-0").selectOption("DONE");
  await page.locator("#check-status-1").selectOption("OBSERVED");
  await page.locator("#check-note-1").fill("Nivel de aceite bajo el mínimo recomendado");

  await page.locator('button:has-text("Continuar")').click();

  // Paso 3: Hallazgos (omitir agregados)
  await page.locator('button:has-text("Continuar")').click();

  // Paso 4: Resumen (finalizar)
  await page.locator('button:has-text("Finalizar")').click();

  // 5. Redirección automática al detalle del reporte
  await expect(page.locator("text=Auditoría Semanal de Planta")).toBeVisible();

  // 6. Descargar el reporte PDF
  const downloadPromise = page.waitForEvent("download");
  await page.locator('button:has-text("Compartir PDF")').click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain("reportflow-");
  expect(download.suggestedFilename()).toContain(".pdf");
});
