import { describe, it, expect } from "vitest";
import { parseBulkItems, convertReportToChecklistItems } from "./utils";

describe("parseBulkItems", () => {
  it("debería parsear múltiples líneas ignorando líneas vacías y espacios adicionales", () => {
    const input = "\n  Ítem 1  \n\n\tÍtem 2\n   \nÍtem 3\n";
    const result = parseBulkItems(input);
    expect(result).toEqual([
      { text: "Ítem 1", note: "" },
      { text: "Ítem 2", note: "" },
      { text: "Ítem 3", note: "" },
    ]);
  });

  it("debería retornar array vacío si el input está vacío o solo contiene espacios", () => {
    expect(parseBulkItems("")).toEqual([]);
    expect(parseBulkItems("\n   \n\t\n")).toEqual([]);
  });
});

describe("convertReportToChecklistItems", () => {
  it("debería limpiar espacios y proveer notas vacías si son nulas", () => {
    const input = [
      { text: "  Texto 1 ", note: " Nota 1 " },
      { text: "Texto 2", note: null },
      { text: "Texto 3" },
    ];
    const result = convertReportToChecklistItems(input);
    expect(result).toEqual([
      { text: "Texto 1", note: "Nota 1" },
      { text: "Texto 2", note: "" },
      { text: "Texto 3", note: "" },
    ]);
  });
});
