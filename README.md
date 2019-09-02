# `octokit-cli`

A cli for [@octokit/rest](https://octokit.github.io/rest.js/).

> NOTE: This a WIP side-project. If you want to see this project do something it doesn't feel free to contribute! Currently the descriptions could use some work.

## Installation

You can either install `octokit-cli` to your project:

```sh
npm i --save-dev octokit-cli
# or
yarn add -D octokit-cli
```

Or globally on your computer:

```sh
npm i -g octokit-cli
```

## Usage

Most commands require authentication to work. To authenticate create a [personal-access-token](https://github.com/settings/tokens) then set `GH_TOKEN` to the token.

Locally you can add your `GH_TOKEN` to a file at the root of your project named `.env`.

```sh
GH_TOKEN=YOUR_PERSONAL_ACCESS_TOKEN
```

Now when you run `octokit-cli` you do not have to include your `GH_TOKEN`.

### Commands

`octokit-cli` is a thin wrapper around [@octokit/rest](https://octokit.github.io/rest.js/) so it has a very similar API.

To get help for every command just add the `--help` flag.

### Examples

_Create a status on a PR_:

```sh
octokit repos create-status --owner hipstersmoothie --repo octokit-cli --state error --sha b3859f9e787145c904aee28668e20960b8407e2 --context "My Status"
```

_Create a comment on a PR_:

```sh
octokit issues create-comment --body "My Comment" --owner hipstersmoothie --repo octokit-cli --issue_number 26
```

_Fuzzy find an emoji_:

Using [fzf](https://github.com/junegunn/fzf)

```sh
octokit emojis get | fzf
```

### Commands in CI

When run from a continuos integration (CI) environment, `octokit-cli` will detect the `owner`, `repo`, and `issue_number` and set these as defaults when running a command.

For example, if you ran the following command from a PR in your CI it would automatically include `owner`, `repo`, and `issue_number`. If ran locally these arguments would be required.

```sh
octokit issues create-comment --body "My Comment"
```

## Contributing

If you want a feature or can fix a bug, submit a PR!

If you think a particular endpoint can be formatted better for the CLI, add a formatter in `src/formatters`.

### Developing

First install the dependencies:

```sh
yarn
```

#### Scripts

- `yarn start` - Build the CLI and watch for changes
- `yarn build` - Create a build of the CLI
