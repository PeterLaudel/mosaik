import { Therapeut } from "./model";
import {
  TherapeutCreate,
  TherapeutRepository,
} from "./repository";

export class TherapeutsService {
  constructor(private readonly therapeutRepository: TherapeutRepository) {}

  async create(therapeut: TherapeutCreate): Promise<Therapeut> {
    return this.therapeutRepository.create(therapeut);
  }

  async update(therapeut: Therapeut): Promise<Therapeut> {
    return this.therapeutRepository.update(therapeut);
  }
}
