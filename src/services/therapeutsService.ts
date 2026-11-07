import { Therapeut } from "@/models/therapeut";
import {
  TherapeutCreate,
  TherapeutRepository,
} from "@/repositories/therapeutRepository";

export class TherapeutsService {
  constructor(private readonly therapeutRepository: TherapeutRepository) {}

  async create(therapeut: TherapeutCreate): Promise<Therapeut> {
    return this.therapeutRepository.create(therapeut);
  }

  async update(therapeut: Therapeut): Promise<Therapeut> {
    return this.therapeutRepository.update(therapeut);
  }
}
