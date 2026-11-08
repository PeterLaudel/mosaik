import { Module } from "@nestjs/common";
import { TestingController } from "./controller";

@Module({ controllers: [TestingController] })
export class TestingModule {}
