/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import PullPackageCommand from '../commands/PullPackage';
import PullTemplateCommand from '../commands/PullTemplate';
import { RepositoryKind } from './Repository';

//  (app.config.paths.packages,  app.config.paths.templates)
export class RepositoryValidator {
    constructor(public packagesPath: string, public templatesPath: string) {
        //
    }

    ensureExists(name: string, kind: RepositoryKind) {
        if (kind === RepositoryKind.PACKAGE) {
            this.ensurePathExists(this.packagesPath);
            PullPackageCommand.handle({ name });
            return true;
        }

        if (kind === RepositoryKind.SKELETON) {
            this.ensurePathExists(this.templatesPath);
            PullTemplateCommand.handle({ name });
            return true;
        }

        return false;
    }

    ensurePackageExists(name: string) {
        return this.ensureExists(name, RepositoryKind.PACKAGE);
    }

    ensureTemplateExists(name: string) {
        return this.ensureExists(name, RepositoryKind.SKELETON);
    }

    protected ensurePathExists(path: string) {
        if (path.length && !existsSync(path)) {
            mkdirSync(path, { recursive: true });
        }
    }
}
