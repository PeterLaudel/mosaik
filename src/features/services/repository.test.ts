import { getDb } from "@/initialize";
import ServicesRepository from "./repository";
import { serviceFactory } from "factories/services";
import { serviceAmountFactory } from "factories/serviceAmounts";
import { ServiceCreate } from "./model";

// A services row plus its three price rows, the shape the repository joins into a Service.
async function createServiceWithAmounts() {
  const row = await serviceFactory.create();
  const amount1 = await serviceAmountFactory.create({ serviceId: row.id, factor: "1.0", price: 10 });
  const amount2 = await serviceAmountFactory.create({ serviceId: row.id, factor: "1.8", price: 18 });
  const amount3 = await serviceAmountFactory.create({ serviceId: row.id, factor: "2.3", price: 23 });
  const amounts = [amount1, amount2, amount3].map(({ factor, price }) => ({ factor, price }));
  const service = { ...row, amounts };
  return service;
}

describe("ServicesRepository", () => {
  let servicesRepository: ServicesRepository;

  beforeEach(() => {
    const db = getDb();
    servicesRepository = new ServicesRepository(db);
  });

  describe("#all", () => {
    it("returns a list of all services", async () => {
      const service = await createServiceWithAmounts();

      const services = await servicesRepository.all();

      expect(services).toEqual([
        { ...service, amounts: expect.arrayContaining(service.amounts) },
      ]);
    });
  });

  describe("#find", () => {
    it("finds the right service", async () => {
      await createServiceWithAmounts();
      const createdService = await createServiceWithAmounts();

      const service = await servicesRepository.find(createdService.id);

      expect(service).toEqual({
        ...createdService,
        amounts: expect.arrayContaining(createdService.amounts),
      });
    });
  });

  describe("#create", () => {
    it("creates a service", async () => {
      const database = getDb();
      const service: ServiceCreate = {
        short: "Kurz",
        originalGopNr: "35425",
        description: "Einzeltherapie",
        note: "Notiz",
        points: 100,
        amounts: [{ factor: "1.0", price: 10 }],
      };

      const result = await servicesRepository.create(service);

      const allServices = await database
        .selectFrom("services")
        .selectAll()
        .execute();
      expect(allServices.length).toEqual(1);
      expect(result).toEqual({ ...service, id: expect.any(Number) });
    });

  });

  describe("#update", () => {
    it("updates an existing service", async () => {
      const service = await createServiceWithAmounts();

      const result = await servicesRepository.update({
        ...service,
        description: "New Description",
      });

      expect(result).toEqual({ ...service, description: "New Description" });
    });
  });
});
