import { config } from '../Configuration';
import { DirectoryNotFoundFixer } from './DirectoryNotFoundFixer';
import { FileDoesNotMatchFixer } from './FileDoesNotMatchFixer';
import { FileNotFoundFixer } from './FileNotFoundFixer';
import { MergeFilesFixer } from './MergeFilesFixer';
import { GithubFixer } from './GithubFixer';
import { OptionalPackagesFixer } from './OptionalPackagesFixer';
import { OverwriteFileFixer } from './OverwriteFileFixer';
import { PackageNotUsedFixer } from './PackageNotUsedFixer';
import { PackageScriptNotFoundFixer } from './PackageScriptNotFoundFixer';
import { PackageVersionFixer } from './PackageVersionFixer';
import { PsalmFixer } from './PsalmFixer';

export class FixerRepository {
    public static all() {
        return [
            // specific fixers:
            MergeFilesFixer,
            GithubFixer,
            PsalmFixer,
            OptionalPackagesFixer,
            // generic fixers:
            DirectoryNotFoundFixer,
            OverwriteFileFixer,
            FileDoesNotMatchFixer,
            FileNotFoundFixer,
            PackageNotUsedFixer,
            PackageScriptNotFoundFixer,
            PackageVersionFixer,
        ].filter(fixer => !config.conf.fixers.disabled?.includes(fixer.prettyName()));
    }
}
