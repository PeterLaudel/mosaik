import { Controller, Get, NotFoundException } from "@nestjs/common";
import { lastEmail } from "./lastEmail";

/** Test-only helpers; registered only when ENABLE_TEST_ENDPOINTS=true (see AppModule). */
@Controller("testing")
export class TestingController {
  @Get("last-email")
  lastEmail() {
    const content = lastEmail.take();
    if (!content) throw new NotFoundException("No email available");
    return JSON.parse((JSON.parse(content) as { message: string }).message);
  }
}
