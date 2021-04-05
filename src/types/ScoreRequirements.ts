import { ComparisonScoreRequirements } from './ComparisonScoreRequirements';
import { FileScoreRequirements } from './FileScoreRequirements';

export interface ScoreRequirements {
    defaults: ComparisonScoreRequirements;
    files: Array<FileScoreRequirements>;
}
