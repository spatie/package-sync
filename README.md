# package-sync

---

`package-sync` helps package repository maintainers keep their package files and settings in sync with a skeleton/template repository.

compares the contents of a package repo against a package skeleton repo, displaying out-of-sync files and other issues.

> 
> **Warning**: this application is under development and may break things!
>

## Requirements

`package-sync` targets node v14+.

## Setup

```bash
npm install

npm run dev
```

## Analyzing packages

Make sure you've modified the configuration file `dist/index.yml`, specifically the `packagesPath` and `templatesPath` settings and that these directories exist.
These settings determine where the repositories are located, and will be cloned into the directory if not already there.
You can use the placeholder `{{__dirname}}` in the values of either setting and it will be replaced with the directory that the config file is in.  Make sure to quote the value if you do this so it's valid YAML!

Example analyzing of `spatie/regex` using the `spatie/package-skeleton-php` repository as a template:

```bash
# compare package repository against the skeleton repository and
# display out-of-sync files and other issues
npm run dev analyze regex
```

You should see something similar to the following:

![image](https://user-images.githubusercontent.com/5508707/113720708-e8484300-96bc-11eb-9a24-d5a59d95ae21.png)

## Manually pulling repositories

You can manually update your local copy of either a skeleton or package git repository.  If the repository already exists locally, the `pull-*` commands will run `git pull` instead of `git clone`.

> It's usually not necessary to run `pull-*` commands manually

> Repositories are cloned/updated automatically when running `analyze` or `fix`.

```bash
# pull an individual skeleton repo by name:
npm run dev pull-template php
npm run dev pull-template laravel

# or pull all skeleton repos:
npm run dev pull-template
```

```bash
npm run dev pull-package array-to-xml
npm run dev pull-package laravel-sluggable
```

## Fixing package issues

>
> **Warning**: this feature is incomplete and DOES modify files in the package's repository directory
>

Issues are resolved by 'fixers', which perform various actions, such as copying a missing file from the skeleton to the package repository.

After an analysis, you'll see a list of the available fixers for each issue.  Note that the `user-review` fixer will prompt you to run other fixers for a given issue, ensuring that only issues that can fixed safely are automated.

To fix all issues with the `regex` package from above, run:

```bash
npm run dev fix regex all
```

![image](https://user-images.githubusercontent.com/5508707/113719038-38bea100-96bb-11eb-8836-47223c6c1be5.png)

You can also only fix certian issues or run specific fixers.

```bash
# only fix the 'missing_pkg' issues:
npm run dev fix regex missing_pkg
```

Run just a specific fixer by name:

```bash
# only run the 'github' fixer:
npm run dev fix array-functions github
```

![image](https://user-images.githubusercontent.com/5508707/113785803-d63ec280-9705-11eb-86ab-793a9ad359a8.png)


Note that this command will make modifications to the package's files, so be careful!

### Fixers

| name | Description |
| --- | --- |
| `copy-script` | adds a missing composer script to the package composer.json file |
| `copy-version` | merges a newer dependency version into the older one |
| `create-dir` | creates a missing directory |
| `create-file` | creates a missing file |
| `install-dep` | adds a new package dependency to the package composer.json file |
| `github` | creates all files/directories in the `.github` directory  |
| `merge-files` | updates a package file with a merged copy of both file versions |
| `merge-version` | updates a composer dependency version |
| `psalm-setup` | installs all psalm-related files, scripts, packages |
| `rewrite-file` | overwrites a file in the package with the skeleton's version of the file |
| `user-review` | asks the user whether or not a file should be fixed automatically |

## Commands

| Command | Aliases | Description |
| --- | --- | --- |
| `analyze <packageName>` | `a`, `an` | Compare a package against a template/skeleton repository |
| `fix <packageName> [type]` | _--_ | Fix a package's issues, optionally only fixing issues of the specified type |
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
