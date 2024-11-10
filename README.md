# Reade

A [LaunchBar](https://www.obdev.at/products/launchbar/) action to interact with the [Readwise](https://readwise.io/) [API](https://readwise.io/api_deets). *Requires a Readwise API token.*

## Usage

Open Reade in LaunchBar, hit the spacebar, enter a command or message, then hit return.

The input will be taken from the clipboard if no text is entered into LaunchBar.

### Actions

Currently, the only and default action is to create a highlight and return its URL.

### Commands

Manage settings by sending commands:

- **`help`**: Display a short user guide.
- **`config list`**: Show current configuration settings.
- **`config reset`**: Reset all configuration options to default.
- **`config set OPTION VALUE`**: Set the configuration OPTION to VALUE, e.g., `config set default_action alert`.
- **`version`**: Display Reade version and check if a new version is available.

## Installation

Prerequisite: you must have [LaunchBar](https://www.obdev.at/products/launchbar/) installed.

### Get a Readwise API token

1. Create a [Readwise account](https://readwise.io/).
2. Get an [API token](https://readwise.io/access_token).

### Install Reade

1. Download `Reade.lbaction.zip` from [releases](https://github.com/quinncomendant/Reade.lbaction/releases).
2. Unzip it, and double-click the resulting `Reade.lbaction` file to install (or manually move it into `~/Library/Application Support/LaunchBar/Actions/`).
3. *(optional)* If you get [this warning message](https://send.strangecode.com/f/gatekeeper-warning.png), run the following command in Terminal.app to remove the [Gatekeeper quarantine](https://support.apple.com/guide/security/gatekeeper-and-runtime-protection-sec5599b66df/web) attribute:
```bash
xattr -d com.apple.quarantine ~/Library/Application\ Support/LaunchBar/Actions/Reade.lbaction
```
4. Open LaunchBar and type `reade` to invoke Reade.
5. Hit the spacebar, type `config set token YOURTOKENHERE`, and hit return to save your API key in LaunchBar:

(Alternatively, you can use `export READWISE_TOKEN="…"` in your shell profile.)

Now you’re ready to use Reade!

## Updating

1. Run the `version` command to check for new versions.
2. Download the new `Reade.lbaction.zip` file from [releases](https://github.com/quinncomendant/Reade.lbaction/releases), unzip it, and double-click it to install.
3. Read the change log on the release page, which may have special instructions such as a requirement to run `config reset` after updating.

## Configuration

The following options can be changed using the `config set OPTION VALUE` command.

To view currently-set values, send the `config list` command.

To reset all configuration options to default, send the `config reset` command.

### Options

- **`token`**: Your OpenAI API key (default: empty or imported from `$READWISE_TOKEN`).
- **`title`**: The title used for [highlights](https://readwise.io/articles), by default: “Highlights saved by Reade”.
- **`timeout`**: How many seconds to wait for a response from the API (default: `10`).

## Support

Contact me on [Twitter](https://twitter.com/com), the [Fediverse](https://mastodon.social/@com), or create a [GitHub issue](https://github.com/quinncomendant/Reade.lbaction/issues).

Do you find this free software useful? [Say thanks with a coffee!](https://ko-fi.com/strangecode)

----

[![Reade icon](docs/Reade-full.png)](docs/Reade-full.png)
