/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */

import { existsSync, mkdirSync } from 'fs';
import { Command } from '../commands/Command';
import PullPackageCommand from '../commands/PullPackage';
import PullTemplateCommand from '../commands/PullTemplate';
import { RepositoryKind } from './Repository';

export class RepositoryValidator {
    constructor(
        public packagesPath: string,
        public templatesPath: string,
        public pullPackageCmd: Command | null = null,
        public pullTemplateCmd: Command | null = null,
    ) {
        this.pullPackageCmd = pullPackageCmd ?? PullPackageCommand;
        this.pullTemplateCmd = pullTemplateCmd ?? PullTemplateCommand;
    }

    ensureExists(name: string, kind: RepositoryKind) {
        if (kind === RepositoryKind.PACKAGE) {
            this.ensurePathExists(this.packagesPath);
            // @ts-ignore
            this.pullPackageCmd.handle({ name });
            return true;
        }

        if (kind === RepositoryKind.SKELETON) {
            this.ensurePathExists(this.templatesPath);
            // @ts-ignore
            this.pullTemplateCmd.handle({ name });
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
