import { therapeutFactory } from "factories/therapeut";
import { TherapeutRepository } from "./therapeutRepository";
import { getDb } from "@/initialize";

describe("TherapeutRepository", () => {
  let therapeutRepository: TherapeutRepository;

  beforeEach(() => {
    const db = getDb();
    therapeutRepository = new TherapeutRepository(db);
  });

  describe("#all", () => {
    it("returns a list of all therapeuts", async () => {
      const therapeut = await therapeutFactory.create();
      const therapeuts = await therapeutRepository.all();

      expect(therapeuts).toEqual([therapeut]);
    });
  });

  describe("#create", () => {
    it("creates a new therapeut", async () => {
      const db = getDb();
      const therapeutData = therapeutFactory.build();
      const savedTherapeut = await therapeutRepository.create(therapeutData);

      expect(savedTherapeut).toMatchObject(therapeutData);
      // check if there is an entry in the db
      const all = await db
        .selectFrom("therapeuts")
        .selectAll()
        .where("id", "=", savedTherapeut.id)
        .execute();
      expect(all.length).toBe(1);
    });

  });

  describe("#update", () => {
    it("updates an existing therapeut", async () => {
      const db = getDb();
      const therapeut = await therapeutFactory.create();
      const updatedData = { ...therapeut, name: "Updated Name" };
      const savedTherapeut = await therapeutRepository.update(updatedData);

      expect(savedTherapeut).toMatchObject(updatedData);
      // check if there is an entry in the db
      const all = await db
        .selectFrom("therapeuts")
        .selectAll()
        .where("id", "=", savedTherapeut.id)
        .execute();
      expect(all.length).toBe(1);
      expect(all[0].name).toBe("Updated Name");
    });
  });
});
