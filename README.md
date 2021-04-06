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
npm run dev pull-template php
npm run dev pull-package regex
npm run dev analyze regex
```

The `pull-*` commands clone the repositories to the local file system _(or run `git pull` if they already exist locally)_.

You should see something similar to the following:

![image](https://user-images.githubusercontent.com/5508707/113592108-bb375a00-9602-11eb-9a85-223350a68be4.png)

## Fixing package issues

>
> **Warning**: this feature is incomplete and DOES modify files in the package's repository directory
>

Issues are resolved by 'fixers', which perform various actions, such as copying a missing file from the skeleton to the package repository.

To fix all issues with the `regex` package from above, run:

```bash
npm run dev fix regex all
```

![image](https://user-images.githubusercontent.com/5508707/113719038-38bea100-96bb-11eb-8836-47223c6c1be5.png)

You can also only fix certian issues or run specific fixers.

```bash
# only fix the 'missing_pkg' issues:
npm run dev fix regex missing_pkg

# only run the 'create-file' fixer:
npm run dev fix regex create-file
```

Note that this command will make modifications to the package's files, so be careful!

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
