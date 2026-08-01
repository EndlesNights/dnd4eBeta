## Developer Tooling

To start, clone this repository and either place it in or symlink it to your `Data/systems/dnd4e` user data directory.

To provide type and i18n support, this repository uses a postinstall script that symlinks your local Foundry installation. For this to work, copy `example-foundry-config.yaml` and rename it to `foundry-config.yaml`, then replace the value of the `installPath` field.

Once this is done you can run `npm install` to install all relevant dependencies. This includes `eslint`, which provides formatting support. Then you can run `npm build` to build the compendia from their source files.

For vscode, you will need to create a `.vscode/settings.json` file with the following:

```json
{
  "eslint.enable": true,
  "eslint.validate": ["javascript", "handlebars", "html"]
}
```

Also copy the following into your `.vscode/settings.json` to support i18n-ally:
```json
"i18n-ally.localesPaths": [
  "foundry/lang",
  "lang"
],
"i18n-ally.keystyle": "nested",
```

### VSCode support for i18n

If you are using VSCode, the i18n Ally (ID: `lokalise.i18n-ally`) extension will preview the content of i18n strings by pulling from both `lang/en.json` as well as the symlinked core translation files at `foundry/lang/en.json`.

### Compendia as JSON

This repository includes some utilities which allow the compendia included in the system to be maintained as JSON files. This makes contributions which include changes to the compendia considerably easier to review.

#### Compiling Packs

Compile the source JSON files into compendium packs.

```text
npm run build:db
```

- `npm run build:db` - Compile all JSON files into their LevelDB files.
- `npm run build:db -- example_powers` - Only compile the specified pack.

#### Extracting Packs

Extract the contents of compendium packs to JSON files.

```text
npm run build:json
```

- `npm run build:json` - Extract all compendium LevelDB files into JSON files.
- `npm run build:json -- example_powers` - Only extract the contents of the specified compendium.
- `npm run build:json -- example_powers basic-attack-melee` - Only extract a single item from the specified compendium.

#### Cleaning Packs

Cleans and formats source JSON files, removing unnecessary permissions and flags and adding the proper spacing.

```text
npm run build:clean
```

- `npm run build:clean` - Clean all source JSON files.
- `npm run build:clean -- example_powers` - Only clean the source files for the specified compendium.
- `npm run build:clean -- example_powers basic-attack-melee` - Only clean a single item from the specified compendium.


## Issues

Check that your Issue isn't a duplicate (also check the closed issues, as sometimes work which has not been released closes an issue).

### Bugs

- Ensure that the bug is reproducible with no modules active. If the bug only happens when a module is active, report it to the module's author instead.
- Provide hosting details as they might be relevant.
- Provide clear step-by-step reproduction instructions, as well as what you expected to happen during those steps vs what actually happened.

### Feature Requests

Any feature request should be considered from the lens of "Does this belong in the core system?"
- Do the Rules as Written (RAW) support this feature? If so, provide some examples.
- Does this feature help a GM run a D&D4e game in Foundry VTT?

## Code

Here are some guidelines for contributing code to this project.

To contribute code, [fork this project](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and submit a [pull request (PR)](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#making-a-pull-request) against the correct development branch.

### Style

Please attempt to follow code style present throughout the project. An ESLint profile is included to help with maintaining a consistent code style. All warnings presented by the linter should be resolved before a PR is submitted.

- `npm run lint` - Run the linter and display any issues found.
- `npm run lint:fix` - Automatically fix any code style issues that can be fixed.

### Linked Issues

When you open an PR it is recommended to [link it to an open issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue). Include which issue it resolves by putting something like this in your description:

```text
Closes #32
```