import { Therapeut } from "@/models/therapeut";
import { TherapeutRepository, TherapeutSave } from "@/repositories/therapeutRepository";

export class TherapeutsService {
  constructor(private readonly therapeutRepository: TherapeutRepository) {}

  async save(therapeut: TherapeutSave): Promise<Therapeut> {
    return this.therapeutRepository.save(therapeut);
  }
}
