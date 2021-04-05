/* eslint-disable no-unused-vars */

export enum ComparisonKind {
    PACKAGE_NOT_USED = 'missing_pkg',
    PACKAGE_VERSION_MISMATCH = 'pkg_version',
    PACKAGE_SCRIPT_NOT_FOUND = 'pkg_script',

    FILE_NOT_FOUND = 'missing_file',
    DIRECTORY_NOT_FOUND = 'missing_dir',

    FILE_DOES_NOT_MATCH = 'not_exact',
    FILE_NOT_SIMILAR_ENOUGH = 'not_similar',

    FILE_NOT_IN_SKELETON = 'extra_file',
    DIRECTORY_NOT_IN_SKELETON = 'extra_dir',

    ALLOWED_SIZE_DIFFERENCE_EXCEEDED = 'size_diff',
}

export interface FileComparisonResult {
    kind: ComparisonKind;
    score: string | number;
    name: string;
    context?: any;
    skeletonPath: string;
    repositoryPath: string;
}
