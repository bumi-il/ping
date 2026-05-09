import { Theme } from '../models/Theme.model.js';
import BaseRepository from './base.repository.js';

class ThemeRepository extends BaseRepository {
    constructor() {
        super(Theme);
    }
}

export default new ThemeRepository();
