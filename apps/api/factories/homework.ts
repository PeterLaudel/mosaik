import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "../src/initialize";
import { HomeworkTable } from "../src/db";
import { sessionFactory } from "./session";

type HomeworkBuild = Omit<Insertable<HomeworkTable>, "id" | "createdAt" | "sessionId"> & {
  sessionId?: number;
};
type HomeworkCreated = Selectable<HomeworkTable>;

export const givenHomeworkFactory = Factory.define<HomeworkBuild, unknown, HomeworkCreated>(
  () => ({
    type: "given",
    description: faker.lorem.sentence(),
    status: null,
  })
).onCreate(async (attrs) => {
  const sessionId = attrs.sessionId ?? (await sessionFactory.create()).id;
  return await getDb()
    .insertInto("homework")
    .values({ ...attrs, sessionId })
    .returningAll()
    .executeTakeFirstOrThrow();
});

export const reviewHomeworkFactory = Factory.define<HomeworkBuild, unknown, HomeworkCreated>(
  () => ({
    type: "review",
    description: faker.lorem.sentence(),
    status: "open",
  })
).onCreate(async (attrs) => {
  const sessionId = attrs.sessionId ?? (await sessionFactory.create()).id;
  return await getDb()
    .insertInto("homework")
    .values({ ...attrs, sessionId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
