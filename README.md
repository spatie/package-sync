<p align="center">
    <img alt="image" height="200" src="https://user-images.githubusercontent.com/5508707/113939320-d902eb80-97c9-11eb-9626-bc159775bf4b.png">
</p>

# package-sync

![version](https://shields.io/npm/v/package-sync-cli) ![license](https://shields.io/github/license/spatie/package-sync) ![Run Tests](https://github.com/spatie/package-sync/actions/workflows/run-tests.yml/badge.svg)

---

`package-sync` helps package repository maintainers keep their package files and settings in sync with a skeleton/template repository.

compares the contents of a package repo against a package skeleton repo, displaying out-of-sync files and other issues.

## Requirements

`package-sync` requires:
- `node v12+`
- `git`

## Installation

You can install this application using npm:

```bash
npm install package-sync-cli

./node_modules/.bin/package-sync analyze array-to-xml
```

or run using `npx`:

```bash
npx package-sync-cli analyze array-to-xml

# with a specific config file
npx package-sync-cli --config myconfig.yml analyze array-to-xml
```

## Local Setup

If you instead prefer to clone the repository, clone with `git clone` and then run:

```bash
npm install

npm run build:prod

./dist/package-sync --help
```

## Configuration

Make sure you've modified the configuration file `dist/package-sync.yml`, specifically the `paths.packages` and `paths.templates` settings.
If the directories don't exist, they will be created for you when you run `package-sync`.

You can use the placeholder `{{__dirname}}` in the values of either setting and it will be replaced with the directory that the config file is in.  

> Make sure to quote the yaml value if you use the `{{__dirname}}` placeholder to ensure valid YAML.

To configure the github user/organization name packages are pulled from, set the `config.packages.vendor` key.

See the configuration file comments for more information on the various options.

## Analyzing packages

After running an analysis, you'll see a list of issues discovered with the package repository and the fixes available for each issue _(not all issues have automated fixes available)_.  Issues include out-of-sync files, missing composer dependencies, required version updates, missing files and more.

Analyze the `spatie/array-to-xml` package using the `spatie/package-skeleton-php` repository as a template:

```bash
./dist/package-sync analyze array-to-xml
```

![image](https://user-images.githubusercontent.com/5508707/113942438-c808a900-97ce-11eb-8546-4d160ccd3e58.png)

Fixers are color-coded:

- `green`: considered safe to run without major file changes
- `blue`: 'multi' fixers run safe fixers on groups of related files _(such as all psalm-related files, etc.)_
- `red`: considered risky - these fixers make _(possibly significant)_ modifications to existing files

#### Issue Scores

The values in the `score` column indicate how similar the package copy of a file is to the skeleton's copy.

For decimal values, the closer to `1.0`, the more similar the files are: `0.75` means the files are somewhat similar, and `0.89` means they are very similar.
Percentages indicate how different the files are: a value of `8.5%` would mean the files are fairly similar, differing by only that much.

If an issue lists a filename but no value, the file only exists in either the skeleton or the package, but not both.

Dependency version issues list a score of `major` or `minor`, indicating the part of the semver version that needs to be upgraded.

Other issues not related to files, such as missing dependencies, do not have a score.

## Fixing package issues

Issues are resolved by `fixers`, which are utilities that perform a various action, such as copying a missing file from the skeleton to the package repository.  The available fixers for an issue are listed in the output of the `analyze` command. 

> If there are multiple fixers listed for an issue, the first one is used when running `fix`.

Some fixers are considered "risky" - meaning they modify existing files.  By default, these fixers will not run automatically when running the `fix` command.  In order to permit risky fixers to run, you must call `fix` with the `--risky` flag.

You can apply all fixers to the discovered issues with the `fix` command.

You may specify both the fixer name and the `--file` flag to apply a fixer to the given file.

```bash
# fix all issues except for those with "risky" fixes
./dist/package-sync fix array-to-xml

# fix all issues
./dist/package-sync fix array-to-xml --risky

# only fix a specific file
./dist/package-sync fix array-to-xml --file psalm.xml.dist

# apply the 'psalm' fixer to only the specified filename
./dist/package-sync fix array-to-xml psalm --file psalm.xml.dist
```
![image](https://user-images.githubusercontent.com/5508707/113923782-f37f9980-97b6-11eb-8b29-9c6ae04c6e03.png)

Fix only certian issue types:

```bash
./dist/package-sync fix array-to-xml missing_pkg
```

Run a specific fixer by name:

```bash
./dist/package-sync fix array-to-xml psalm
```

![image](https://user-images.githubusercontent.com/5508707/113923468-91bf2f80-97b6-11eb-807d-cfaee1b107af.png)

Apply a specific fixer to a specific file:

```bash
./dist/package-sync fix array-to-xml psalm --file psalm.xml.dist
```

![image](https://user-images.githubusercontent.com/5508707/113930020-c1723580-97be-11eb-9c02-be3b94cf033b.png)

### Fixers

| name | note | description |
| --- | --- | --- |
| `add-dep` | | adds a dependency to the package's composer.json file. |
| `bump-version` | | updates the version of a dependency in the package repository. |
| `copy-script` | | adds a missing composer script to the package's composer.json file. |
| `create-dir` | | creates a missing directory |
| `create-file` | | copies a file from the skeleton repository into the package repository. |
| `github` | multi  | recreates all missing directories and files under the '.github' directory. |
| `merge-files` | risky  | merges the contents of both the skeleton and package versions of a file. |
| `overwrite-file` | risky  | overwrite a file with the skeleton version to force an exact match. |
| `psalm` | multi  | creates all missing psalm-related files and installs all psalm composer scripts and dependencies. |
| `rewrite-file` | risky  | overwrites an existing file with a newer version from the skeleton. |
| `skip-dep` | | skips the installation of a dependency. |

## Manually pulling repositories

You can manually update your local copy of either a skeleton or package git repository.  If the repository already exists locally, the `pull-*` commands will run `git pull` instead of `git clone`.

> It's usually not necessary to run `pull-*` commands manually

> Repositories are cloned/updated automatically when running `analyze` or `fix`.

```bash
# pull an individual skeleton repo by name:
./dist/package-sync pull-template php
./dist/package-sync pull-template laravel

# or pull all skeleton repos:
./dist/package-sync pull-template
```

```bash
# pull the spatie/array-to-xml package repo
./dist/package-sync pull-package array-to-xml

# pull spatie/laravel-sluggable
./dist/package-sync pull-package laravel-sluggable
```

## Commands

| Command | Aliases | Description |
| --- | --- | --- |
| `analyze <packageName>` | `a`, `an` | Compare a package against a template/skeleton repository |
| `fix <packageName> [type]` | _--_ | Fix a package's issues, optionally only fixing issues of the specified type |
| `fixers` | _--_ | List all fixers and their descriptions |
| `pull-template [name]` | `pt` | Update/retrieve the named skeleton repository, or all if no name specified |
| `pull-package <name>` | `pp` | Update/retrieve the named package repository |

## Testing

`package-sync` uses Jest for unit tests.  To run the test suite:

```bash
npm run test
```

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Patrick Organ](https://github.com/patinthehat)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
