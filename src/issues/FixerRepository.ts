import { config } from '../Configuration';
import { DirectoryNotFoundFixer } from './fixers/DirectoryNotFoundFixer';
import { FileDoesNotMatchFixer } from './fixers/FileDoesNotMatchFixer';
import { FileIsNotSimilarEnoughFixer } from './fixers/FileIsNotSimilarEnoughFixer';
import { FileNotFoundFixer } from './fixers/FileNotFoundFixer';
import { GitFileFixer } from './fixers/GitFileFixer';
import { GithubFixer } from './fixers/GithubFixer';
import { OptionalPackagesFixer } from './fixers/OptionalPackagesFixer';
import { OverwriteFileFixer } from './fixers/OverwriteFileFixer';
import { PackageNotUsedFixer } from './fixers/PackageNotUsedFixer';
import { PackageScriptNotFoundFixer } from './fixers/PackageScriptNotFoundFixer';
import { PackageVersionFixer } from './fixers/PackageVersionFixer';
import { PsalmFixer } from './fixers/PsalmFixer';

export class FixerRepository {
    public static all() {
        return [
            // specific fixers:
            GitFileFixer,
            GithubFixer,
            PsalmFixer,
            OptionalPackagesFixer,
            // generic fixers:
            DirectoryNotFoundFixer,
            FileIsNotSimilarEnoughFixer,
            OverwriteFileFixer,
            FileDoesNotMatchFixer,
            FileNotFoundFixer,
            PackageNotUsedFixer,
            PackageScriptNotFoundFixer,
            PackageVersionFixer,
        ].filter(fixer => !config.conf.fixers.disabled?.includes(fixer.prettyName()));
    }
}
