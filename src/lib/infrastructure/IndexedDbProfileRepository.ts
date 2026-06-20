import { getDb } from "./IndexedDbReportRepository";
import type { UserProfile, Company } from "@/lib/domain/types";

export class IndexedDbProfileRepository {
  async getProfile(): Promise<UserProfile | null> {
    const db = await getDb();
    const profile = await db.get("profile", "user");
    return profile || null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const db = await getDb();
    await db.put("profile", profile, "user");
  }

  async listCompanies(): Promise<Company[]> {
    const db = await getDb();
    const companies = await db.getAll("companies");
    // Sort so default is first, then by name
    return companies.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  async getCompany(id: string): Promise<Company | null> {
    const db = await getDb();
    const company = await db.get("companies", id);
    return company || null;
  }

  async saveCompany(company: Company): Promise<void> {
    const db = await getDb();
    const tx = db.transaction("companies", "readwrite");
    const store = tx.objectStore("companies");

    if (company.isDefault) {
      const allCompanies = await store.getAll();
      for (const comp of allCompanies) {
        if (comp.id !== company.id && comp.isDefault) {
          comp.isDefault = false;
          await store.put(comp);
        }
      }
    }

    await store.put(company);
    await tx.done;
  }

  async deleteCompany(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("companies", id);
  }

  async setDefaultCompany(id: string): Promise<void> {
    const db = await getDb();
    const tx = db.transaction("companies", "readwrite");
    const store = tx.objectStore("companies");
    const allCompanies = await store.getAll();

    for (const comp of allCompanies) {
      const isTarget = comp.id === id;
      if (comp.isDefault !== isTarget) {
        comp.isDefault = isTarget;
        await store.put(comp);
      }
    }

    await tx.done;
  }
}

export const profileRepository = new IndexedDbProfileRepository();
