import { test, expect } from "@playwright/test";

test("flujo de onboarding completo (perfil + empresa) y redirección al dashboard", async ({ page }) => {
  // 1. Abrir la app
  await page.goto("/");

  // 2. Verificar que se muestre el Onboarding
  const onboardingTitle = page.locator("text=Bienvenido a ReportFlow");
  await expect(onboardingTitle).toBeVisible({ timeout: 10000 });

  // 3. Llenar los datos del Paso 1: Perfil
  await page.locator("#first-name").fill("Juan");
  await page.locator("#last-name").fill("Doe");
  await page.locator("#user-role").fill("Inspector de Prueba");
  await page.locator("#user-email").fill("juan.doe@example.com");

  // Click en continuar
  await page.locator('button:has-text("Continuar")').click();

  // 4. Llenar los datos del Paso 2: Empresa
  const companyTitle = page.locator("text=Branding de Empresa");
  await expect(companyTitle).toBeVisible();

  await page.locator("#comp-name").fill("Empresa de Prueba S.A.");
  await page.locator("#comp-area").fill("Departamento de QA");
  await page.locator("#comp-footer").fill("Documento privado de prueba");

  // Guardar y empezar
  await page.locator('button:has-text("Guardar y empezar")').click();

  // 5. Verificar que el onboarding desaparezca y cargue el Dashboard
  await expect(onboardingTitle).not.toBeVisible();
  
  // El menú de navegación debe mostrar las iniciales del perfil "JD"
  const userInitials = page.locator("text=JD");
  await expect(userInitials).toBeVisible();

  // Debe aparecer la sección de reportes del Dashboard
  const recentReports = page.locator("text=Actividad reciente");
  await expect(recentReports).toBeVisible();
});
