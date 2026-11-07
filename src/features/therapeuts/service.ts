import { Therapeut, TherapeutCreate } from "./model";
import { TherapeutRepository } from "./repository";

export class TherapeutsService {
  constructor(private readonly therapeutRepository: TherapeutRepository) {}

  async all(): Promise<Therapeut[]> {
    return this.therapeutRepository.all();
  }

  async create(therapeut: TherapeutCreate): Promise<Therapeut> {
    return this.therapeutRepository.create(therapeut);
  }

  async update(therapeut: Therapeut): Promise<Therapeut> {
    return this.therapeutRepository.update(therapeut);
  }
}
