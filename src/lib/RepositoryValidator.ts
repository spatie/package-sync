import { existsSync, mkdirSync } from 'fs';
import { app } from '../Application';
import PullPackageCommand from '../commands/PullPackage';
import PullTemplateCommand from '../commands/PullTemplate';
import { RepositoryKind } from './Repository';

export class RepositoryValidator {
    static ensureExists(name: string, kind: RepositoryKind) {
        if (kind === RepositoryKind.PACKAGE) {
            this.ensurePathExists(app.config.packagesPath);
            PullPackageCommand.handle({ name });
            return true;
        }

        if (kind === RepositoryKind.SKELETON) {
            this.ensurePathExists(app.config.templatesPath);
            PullTemplateCommand.handle({ name });
            return true;
        }

        return false;
    }

    static ensurePackageExists(name: string) {
        return this.ensureExists(name, RepositoryKind.PACKAGE);
    }

    static ensureTemplateExists(name: string) {
        return this.ensureExists(name, RepositoryKind.SKELETON);
    }

    protected static ensurePathExists(path: string) {
        if (path.length && !existsSync(path)) {
            mkdirSync(path, { recursive: true });
        }
    }
}
