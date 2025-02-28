# NitroQA Automation Testing with Playwright
The QA study group is working on the Playwright From Zero to Hero course on Udemy, so as part of my learning I have started to compile test suites inside of Nitro's QA environment. This repository can be used and shared by other QAs looking to practice their skills with PW. Huge thank you to Mike Clancy for helping to develop the setup scripts and config files that are used here.

## Authenticating a User and Storing Session Data

If you are using an authenticator app to login to Nitro, feel free to skip this step. With recent changes to NitroID and the use of pass keys, this is an alternative, more manual method to authenticate yourself before you can run tests.

```bash
npx playwright open --save-storage session.json
```

Running this command will open a chromium browser where you can navigate to whichever environment(s) you want to run tests in. Closing this window saves your session data to the session.json file where it can be accessed by the test scripts.

## How Do I Run The Tests?

First, make sure Playwright is installed properly

When testing stories and PRs in Power BT, the url of the review env is dynamic. For that reason and to make testing easier, we've setup a script in the [test.sh](./test.sh) file to allow you to enter the url of the review env or enter nothing to default to the QA url. You are also able to enter all of the normal mofications and flags that you would enter if you were just using the `npx playwright test` command (e.g. `--ui` or `path/to/file.spec.ts`). If you want to specify the url, it has to be the first argument, and it has to be a valid url starting with `https://`.

**Basic Formula:** `zsh test.sh [optional url (no valid url defaults to QA)] [any other flags/modifications]`

**Note**

We are using the `zsh` command here to avoid having to grant permissions with `chmod +x test.sh`, but if you're ok with granting the permission, use the `chmod +x test.sh` command and the following commands can be run with just `./test.sh` instead of the `zsh test.sh`

### Examples:

#### Run All Tests in QA

```bash
zsh test.sh
```

#### Run Specific Test in QA

```bash
zsh test.sh tests/specificTest.spec.ts
```

#### Run Specific Test in QA in UI Mode

```bash
zsh test.sh tests/specificTest.spec.ts --ui
```

#### Run Specific Test in Review Env

```bash
zsh test.sh https://pr45298.nitro-web.beta.px.powerapp.cloud tests/specificTest.spec.ts
```

#### Run All Tests in a Specified Review Env URL

```bash
zsh test.sh https://pr45298.nitro-web.beta.px.powerapp.cloud
```

#### Run All Tests in a Specified Review Env URL in UI mode

```bash
zsh test.sh https://pr45298.nitro-web.beta.px.powerapp.cloud --ui
```
