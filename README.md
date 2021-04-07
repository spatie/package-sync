# package-sync

---

`package-sync` helps package repository maintainers keep their package files and settings in sync with a skeleton/template repository.

compares the contents of a package repo against a package skeleton repo, displaying out-of-sync files and other issues.

## Requirements

`package-sync` targets node v14+.

## Setup

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

See the configuration file comments for more information on the various options.

## Analyzing packages

After running an analysis, you'll see a list of issues discovered with the package repository and the fixes available for each issue _(not all issues have automated fixes available)_.  Issues include out-of-sync files, missing composer dependencies, required version updates, missing files and more.

Analyze the `spatie/regex` package using the `spatie/package-skeleton-php` repository as a template:

```bash
./dist/package-sync analyze regex
```

You should see something similar to the following:

![image](https://user-images.githubusercontent.com/5508707/113916224-bd89e780-97ad-11eb-91f4-dee813cf1807.png)

Fixers are color-coded:

- `green`: considered safe to run automatically
- `blue`: considered 'multi' fixers, these apply to groups of related files
- `red`: considered risky - these fixers make _(possibly significant)_ modifications to existing files

## Fixing package issues

>
> **Warning**: this feature is incomplete and DOES modify files in the package's repository directory
>

Issues are resolved by 'fixers', which perform various actions, such as copying a missing file from the skeleton to the package repository.


You can fix all package issues with the `fix` command.  By default, fixers considered "risky" _(meaning they modify existing files)_ are skipped unless the `--risky` flag is provided when running `fix`.

If multiple fixers are listed for an issue, you may specify both the fixer name and the `--file` flag to apply the fixer to the given file.  

If the fixer name is not specified, the first fixer listed will be used to resolve the issue.

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
| `user-review` | | file is out of sync with the skeleton version and user action is required. |

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
./dist/package-sync pull-package array-to-xml
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

`npm run test`

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
