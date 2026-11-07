import { getDb } from "../initialize";
import ServicesRepository from "./servicesRepository";
import { serviceFactory } from "../../factories/service";

describe("ServicesRepository", () => {
  let servicesRepository: ServicesRepository;

  beforeEach(() => {
    const db = getDb();
    servicesRepository = new ServicesRepository(db);
  });

  describe("#all", () => {
    it("returns a list of all services", async () => {
      const service = await serviceFactory.create();

      const services = await servicesRepository.all();

      expect(services).toEqual([
        { ...service, amounts: expect.arrayContaining(service.amounts) },
      ]);
    });
  });

  describe("#find", () => {
    it("finds the right service", async () => {
      await serviceFactory.create();
      const createdService = await serviceFactory.create();

      const service = await servicesRepository.find(createdService.id);

      expect(createdService).toEqual({
        ...service, 
        amounts: expect.arrayContaining(createdService.amounts),
      });
    });
  });

  describe("#save", () => {
    it("creates a service when no id is provided", async () => {
      const database = getDb();
      const service = serviceFactory.build();

      const result = await servicesRepository.save(service);

      const allServices = await database
        .selectFrom("services")
        .selectAll()
        .execute();
      expect(allServices.length).toEqual(1);
      expect(result).toEqual({ ...service, id: expect.any(Number) });
    });

    it("updates a service when id is provided", async () => {
      const service = await serviceFactory.create();

      const result = await servicesRepository.save({
        ...service,
        description: "New Description",
      });

      expect(result).toEqual({ ...service, description: "New Description" });
    });
  });
});
