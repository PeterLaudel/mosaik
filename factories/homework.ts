import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { Insertable, Selectable } from "kysely";
import { getDb } from "@/initialize";
import { Database } from "@/db";
import { sessionFactory } from "./sessions";

type HomeworkRow = Database["homework"];
type HomeworkBuild = Omit<Insertable<HomeworkRow>, "id" | "createdAt" | "sessionId"> & {
  sessionId?: number;
};
type HomeworkCreated = Selectable<HomeworkRow>;

// Defaults to a "given" homework row. For review homework pass { type: "review", status: "open" }.
export const homeworkFactory = Factory.define<HomeworkBuild, unknown, HomeworkCreated>(() => ({
  type: "given",
  description: faker.lorem.sentence(),
  status: null,
})).onCreate(async (attrs) => {
  let { sessionId } = attrs;
  if (sessionId === undefined) {
    const session = await sessionFactory.create();
    sessionId = session.id;
  }
  const db = getDb();
  return db
    .insertInto("homework")
    .values({ ...attrs, sessionId })
    .returningAll()
    .executeTakeFirstOrThrow();
});
