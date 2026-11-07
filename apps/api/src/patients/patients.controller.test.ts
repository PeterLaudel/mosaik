import { Test } from "@nestjs/testing";
import { call } from "@orpc/server";
import { patientFactory } from "../../factories/patient";
import { getDb } from "../initialize";
import { PatientsRepository } from "../repositories/patientsRepository";
import type { AuthenticatedRequest } from "../orpc";
import { PatientsController } from "./patients.controller";

describe("PatientsController", () => {
  let controller: PatientsController;
  const context = { request: {} as AuthenticatedRequest };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [{ provide: PatientsRepository, useValue: new PatientsRepository(getDb()) }],
    }).compile();
    controller = moduleRef.get(PatientsController);
  });

  it("lists patients filtered by search with coerced paging params", async () => {
    await patientFactory.create({ name: "Jane", surname: "Doe" });
    await patientFactory.create({ name: "John", surname: "Doe" });

    const result = await call(controller.router().list, { search: "Jane", page: "0", pageSize: "10" } as never, { context });

    expect(result.total).toBe(1);
    expect(result.rows[0]).toMatchObject({ name: "Jane", surname: "Doe" });
  });

  it("returns NOT_FOUND for an unknown patient", async () => {
    await expect(call(controller.router().find, { id: 999999 }, { context })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rejects invalid input with BAD_REQUEST", async () => {
    const rest = patientFactory.build();

    await expect(call(controller.router().create, { ...rest, address: { ...rest.address, zip: "12" } }, { context })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("creates and updates a patient", async () => {
    const data = patientFactory.build();

    const created = await call(controller.router().create, data, { context });
    const updated = await call(controller.router().update, { ...created, surname: "Neu" }, { context });

    expect(updated).toMatchObject({ id: created.id, surname: "Neu" });
  });
});
