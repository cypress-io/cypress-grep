# cypress-grep

[![ci status][ci image]][ci url] [![badges status][badges image]][badges url] [![renovate-app badge][renovate-badge]][renovate-app] ![cypress version](https://img.shields.io/badge/cypress-8.7.0-brightgreen)

> Filter tests using substring

```shell
# run only tests with "hello" in their names
npx cypress run --env grep=hello

  ✓ hello world
  - works
  - works 2 @tag1
  - works 2 @tag1 @tag2

  1 passing (38ms)
  3 pending
```

All other tests will be marked pending, see why in the [Cypress test statuses](https://on.cypress.io/writing-and-organizing-tests#Test-statuses) blog post.

If you have multiple spec files, all specs will be loaded, and every test will be filtered the same way, since the grep is run-time operation and cannot eliminate the spec files without loading them. If you want to run only specific tests, use the built-in [--spec](https://on.cypress.io/command-line#cypress-run-spec-lt-spec-gt) CLI argument.

Watch the video [intro to cypress-grep plugin](https://www.youtube.com/watch?v=HS-Px-Sghd8)

## Install

Assuming you have Cypress installed, add this module as a dev dependency

```shell
# using NPM
npm i -D cypress-grep
# using Yarn
yarn add -D cypress-grep
```

**required:** load this module from the [support file](https://on.cypress.io/writing-and-organizing-tests#Support-file) or at the top of the spec file if not using the support file.

```js
// cypress/support/index.js
// load and register the grep feature
// https://github.com/cypress-io/cypress-grep
require('cypress-grep')()
```

### Plugin file

**optional:** load and register this module from the [plugin file](https://on.cypress.io/writing-and-organizing-tests#Plugins-file)

```js
// cypress/plugins/index.js
module.exports = (on, config) => {
  // optional: register cypress-grep plugin code
  // https://github.com/cypress-io/cypress-grep
  require('cypress-grep/src/plugin')(config)
  // make sure to return the config object
  // as it might have been modified by the plugin
  return config
}
```

By loading this module from the plugin file, it allows the `cypress-grep` to print a little message on load, for example

```shell
$ npx cypress run --env grep=hello
cypress-grep: tests with "hello" in their names
```

Installing the plugin in the project's plugin file is also required to enable the [grepFilterSpecs](#grepfilterspecs) feature.

## Use

Start grepping by title and tags:

```shell
# run only the tests with "auth user" in the title
$ npx cypress run --env grep="auth user"
# run tests with "hello" or "auth user" in their titles
# by separating them with ";" character
$ npx cypress run --env grep="hello; auth user"
# run tests tagged @fast
$ npx cypress run --env grepTags=@fast
# run only the tests tagged "smoke"
# that have "login" in their titles
$ npx cypress run --env grep=login,grepTags=smoke
# only run the specs that have any tests with "user" in their titles
$ npx cypress run --env grep=user,grepFilterSpecs=true
# only run the specs that have any tests tagged "@smoke"
$ npx cypress run --env grepTags=@smoke,grepFilterSpecs=true
# run only tests that do not have any tags
# and are not inside suites that have any tags
$ npx cypress run --env grepUntagged=true
```

## Videos

Watch the video [intro to cypress-grep](https://www.youtube.com/watch?v=HS-Px-Sghd8) which shows how this repository tags tests, uses [cypress-grep](https://github.com/cypress-io/cypress-grep) plugin, and sets up the TypeScript intelligent code completion.

You can also watch [How I organize pull request workflows](https://youtu.be/SFW7Ecj5TNE) where I show how the GitHub workflows in [.github/workflows](./.github/workflows) are organized to run the smoke tests first on pull request.

Watch the video [Filter Specs First When Using cypress-grep Plugin](https://youtu.be/adL7KzO5dR0)

Watch the video [Run All Tests That Have No Tags Using cypress-grep Plugin](https://youtu.be/CtU43GzaicI)

## Blog posts

- [Burning Tests with cypress-grep](https://glebbahmutov.com/blog/burning-tests/)
- [Faster test execution with cypress-grep](https://glebbahmutov.com/blog/cypress-grep-filters/)

## Filters

You can filter tests to run using part of their title via `grep`, and via explicit tags via `grepTags` Cypress environment variables.

Most likely you will pass these environment variables from the command line. For example, to only run tests with "login" in their title and tagged "smoke", you would run:

```shell
$ npx cypress run --env grep=login,grepTags=smoke
```

You can use any way to modify the environment values `grep` and `grepTags`, except the run-time `Cypress.env('grep')` (because it is too late at run-time). You can set the `grep` value in the `cypress.json` file to run only tests with the substring `viewport` in their names

```json
{
  "env": {
    "grep": "viewport"
  }
}
```

You can also set the `env.grep` object in the plugin file, but remember to return the changed config object:

```js
// cypress/plugin/index.js
module.exports = (on, config) => {
  config.env.grep = 'viewport'
  return config
}
```

You can also set the grep and grepTags from the DevTools console while running Cypress in the interactive mode `cypress open`, see [DevTools Console section](#devtools-console).

### Disable grep

If you specify the `grep` parameters inside `cypress.json` file, you can disable it from the command line

```
$ npx cypress run --env grep=,grepTags=,burn=
```

### grep by test title

```shell
# run all tests with "hello" in their title
$ npx cypress run --env grep=hello
# run all tests with "hello world" in their title
$ npx cypress run --env grep="hello world"
```

You can pass multiple title substrings to match separating them with `;` character. Each substring is trimmed.

```shell
# run all tests with "hello world" or "auth user" in their title
$ npx cypress run --env grep="hello world; auth user"
```

### negative filter

```shell
# run all tests WITHOUT "hello world" in their title
$ npx cypress run --env grep="-hello world"
# run tests with "hello", but without "word" in the titles
$ npx cypress run --env grep="hello; -world"
```

## Filter with tags

You can select tests to run or skip using tags by passing `--env grepTags=...` value.

```
# enable the tests with tag "one" or "two"
--env grepTags="one two"
# enable the tests with both tags "one" and "two"
--env grepTags="one+two"
# enable the tests with "hello" in the title and tag "smoke"
--env grep=hello,grepTags=smoke
```

If you can pass commas in the environment variable `grepTags`, you can use `,` to separate the tags

```
# enable the tests with tag "one" or "two"
CYPRESS_grepTags=one,two npx cypress run
```

### Tags in the test config object

Cypress tests can have their own [test config object](https://on.cypress.io/configuration#Test-Configuration), and when using this plugin you can put the test tags there, either as a single tag string or as an array of tags.

```js
it('works as an array', { tags: ['config', 'some-other-tag'] }, () => {
  expect(true).to.be.true
})

it('works as a string', { tags: 'config' }, () => {
  expect(true).to.be.true
})
```

You can run both of these tests using `--env grepTags=config` string.

### grepFilterSpecs

By default, when using `grep` and `grepTags` all specs are executed, and inside each the filters are applied. This can be very wasteful, if only a few specs contain the `grep` in the test titles. Thus when doing the positive `grep`, you can pre-filter specs using the `grepFilterSpecs=true` parameter.

```
# filter all specs first, and only run the ones with
# suite or test titles containing the string "it loads"
$ npx cypress run --env grep="it loads",grepFilterSpecs=true
# filter all specs files, only run the specs with a tag "@smoke"
$ npx cypress run --env grepTags=@smoke,grepFilterSpecs=true
```

Note: this requires installing this plugin in your project's plugin file, see the [Install](#install).

Note 2: the `grepFilterSpecs` option is only compatible with the positive `grep` and `grepTags` options, not with the negative "!..." filter.

Note 3: if there are no files remaining after filtering, the plugin prints a warning and leaves all files unchanged to avoid the test runner erroring with "No specs found".

**Tip:** you can set this environment variable in the `cypress.json` file to enable it by default and skip using the environment variable:

```json
{
  "env": {
    "grepFilterSpecs": true
  }
}
```

### omit filtered tests

By default, all filtered tests are made _pending_ using `it.skip` method. If you want to completely omit them, pass the environment variable `grepOmitFiltered=true`.

Pending filtered tests

```
cypress run --env grep="works 2"
```

![Pending tests](./images/includes-pending.png)

Omit filtered tests

```
cypress run --env grep="works 2",grepOmitFiltered=true
```

![Only running tests remaining](./images/omit-pending.png)

**Tip:** you can set this environment variable in the `cypress.json` file to enable it by default and skip using the environment variable:

```json
{
  "env": {
    "grepOmitFiltered": true
  }
}
```

### grep untagged tests

Sometimes you want to run only the tests without any tags, and these tests are inside the describe blocks without any tags.

```
$ npx cypress run --env grepUntagged=true
```

### TypeScript users

Because the Cypress test config object type definition does not have the `tags` property we are using above, the TypeScript linter will show an error. Just add an ignore comment above the test:

```js
// @ts-ignore
it('runs on deploy', { tags: 'smoke' }, () => {
  ...
})
```

This package comes with [src/index.d.ts](./src/index.d.ts) definition file that adds the property `tags` to the Cypress test overrides interface. Include this file in your specs or TS config settings. For example, you can load it using a reference comment

```js
// cypress/integration/my-spec.js
/// <reference types="cypress-grep" />
```

If you have `tsconfig.json` file, add this library to the types list

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "cypress-grep"]
  },
  "include": ["**/*.ts"]
}
```

## Test suites

The tags are also applied to the "describe" blocks. In that case, the tests look up if any of their outer suites are enabled.

```js
describe('block with config tag', { tags: '@smoke' }, () => {})
```

```
# run any tests in the blocks having "@smoke" tag
--env grepTags=@smoke
# skip any blocks with "@smoke" tag
--env grepTags=-@smoke
```

See the [cypress/integration/describe-tags-spec.js](./cypress/integration/describe-tags-spec.js) file.

**Note:** global function `describe` and `context` are aliases and both supported by this plugin.

### AND tags

Use `+` to require both tags to be present

```
--env grepTags=@smoke+@fast
```

### Invert tag

You can skip running the tests with specific tag using the invert option: prefix the tag with the character `-`.

```
# do not run any tests with tag "@slow"
--env grepTags=-@slow
```

If you want to run all tests with tag `@slow` but without tag `@smoke`:

```
--env grepTags=@slow+-@smoke
```

### OR tags

You can run tests that match one tag or another using spaces. Make sure to quote the grep string!

```
# run tests with tags "@slow" or "@critical" in their names
--env grepTags='@slow @critical'
```

## Burn

You can repeat (burn) the filtered tests to make sure they are flake-free

```
npx cypress run --env grep="hello world",burn=5
```

You can pass the number of times to run the tests via environment name `burn` or `grepBurn` or `grep-burn`. Note, if a lot of tests match the grep and grep tags, a lot of tests will be burnt!

If you do not specify the "grep" or "grep tags" option, the "burn" will repeat _every_ test.

## General advice

- keep it simple.
- I like using `@` as tag prefix to make the tags searchable

```js
// ✅ good practice
describe('auth', { tags: '@critical' }, () => ...)
it('works', { tags: '@smoke' }, () => ...)
it('works quickly', { tags: ['@smoke', '@fast'] }, () => ...)

// 🚨 NOT GOING TO WORK
// ERROR: treated as a single tag,
// probably want an array instead
it('works', { tags: '@smoke @fast' }, () => ...)
```

Grepping the tests

```shell
# run the tests by title
$ npx cypress run --env grep="works quickly"
# run all tests tagged @smoke
$ npx cypress run --env grepTags=@smoke
# run all tests except tagged @smoke
$ npx cypress run --env grepTags=-@smoke
# run all tests that have tag @fast but do not have tag @smoke
$ npx cypress run --env grepTags=@fast+-@smoke
```

I would run all tests by default, and grep tests from the command line. For example, I could run the smoke tests first using grep plugin, and if the smoke tests pass, then run all the tests. See the video [How I organize pull request workflows by running smoke tests first](https://www.youtube.com/watch?v=SFW7Ecj5TNE) and its [pull request workflow file](https://github.com/bahmutov/cypress-grep-example/blob/main/.github/workflows/pr.yml).

## DevTools console

You can set the grep string from the DevTools Console. This plugin adds method `Cypress.grep` and `Cypress.grepTags` to set the grep strings and restart the tests

```js
// filter tests by title substring
Cypress.grep('hello world')
// run filtered tests 100 times
Cypress.grep('hello world', null, 100)
// filter tests by tag string
// in this case will run tests with tag @smoke OR @fast
Cypress.grep(null, '@smoke @fast')
// run tests tagged @smoke AND @fast
Cypress.grep(null, '@smoke+@fast')
// run tests with title containing "hello" and tag @smoke
Cypress.grep('hello', '@smoke')
// run tests with title containing "hello" and tag @smoke 10 times
Cypress.grep('hello', '@smoke', 10)
```

- to remove the grep strings enter `Cypress.grep()`

## Debugging

When debugging a problem, first make sure you are using the expected version of this plugin, as some features might be only available in the [later releases](https://github.com/cypress-io/cypress-grep/releases).

```
# get the cypress-grep version using NPM
$ npm ls cypress-grep
...
└── cypress-grep@2.10.1
# get the cypress-grep version using Yarn
$ yarn why cypress-grep
...
=> Found "cypress-grep@2.10.1"
info Has been hoisted to "cypress-grep"
info This module exists because it's specified in "devDependencies".
...
```

Second, make sure you are passing the values to the plugin correctly by inspecting the "Settings" tab in the Cypress Desktop GUI screen. You should see the values you have passed in the "Config" object under the `env` property. For example, if I start the Test Runner with

```text
$ npx cypress open --env grep=works,grepFilterTests=true
```

Then I expect to see the grep string and the "filter tests" flag in the `env` object.

![Values in the env object](./images/config.png)

### Log messages

This module uses [debug](https://github.com/visionmedia/debug#readme) to log verbose messages. You can enable the debug messages in the plugin file (runs when discovering specs to filter), and inside the browser to see how it determines which tests to run and to skip. When opening a new issue, please provide the debug logs from the plugin (if any) and from the browser.

### Debugging in the plugin

Start Cypress with the environment variable `DEBUG=cypress-grep`. You will see a few messages from this plugin in the terminal output:

```
$ DEBUG=cypress-grep npx cypress run --env grep=works,grepFilterSpecs=true
cypress-grep: tests with "works" in their names
cypress-grep: filtering specs using "works" in the title
  cypress-grep Cypress config env object: { grep: 'works', grepFilterSpecs: true }
  ...
  cypress-grep found 1 spec files +5ms
  cypress-grep [ 'spec.js' ] +0ms
  cypress-grep spec file spec.js +5ms
  cypress-grep suite and test names: [ 'hello world', 'works', 'works 2 @tag1',
    'works 2 @tag1 @tag2', 'works @tag2' ] +0ms
  cypress-grep found "works" in 1 specs +0ms
  cypress-grep [ 'spec.js' ] +0ms
```

### Debugging in the browser

To enable debug console messages in the browser, from the DevTools console set `localStorage.debug='cypress-grep'` and run the tests again.

![Debug messages](./images/debug.png)

To see how to debug this plugin, watch the video [Debug cypress-grep Plugin](https://youtu.be/4YMAERddHYA).

## Examples

- [cypress-grep-example](https://github.com/bahmutov/cypress-grep-example)
- [todo-graphql-example](https://github.com/bahmutov/todo-graphql-example)

## See also

- [cypress-select-tests](https://github.com/bahmutov/cypress-select-tests)
- [cypress-skip-test](https://github.com/cypress-io/cypress-skip-test)

## Migration guide

### from v1 to v2

In v2 we have separated grepping by part of the title string from tags.

**v1**

```
--env grep="one two"
```

The above scenario was confusing - did you want to find all tests with title containing "one two" or did you want to run tests tagged `one` or `two`?

**v2**

```
# enable the tests with string "one two" in their titles
--env grep="one two"
# enable the tests with tag "one" or "two"
--env grepTags="one two"
# enable the tests with both tags "one" and "two"
--env grepTags="one+two"
# enable the tests with "hello" in the title and tag "smoke"
--env grep=hello,grepTags=smoke
```

## Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2021

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/cypress-io/cypress-grep/issues) on Github

## MIT License

Copyright (c) 2021 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[ci image]: https://github.com/cypress-io/cypress-grep/workflows/ci/badge.svg?branch=main
[ci url]: https://github.com/cypress-io/cypress-grep/actions
[badges image]: https://github.com/cypress-io/cypress-grep/workflows/badges/badge.svg?branch=main
[badges url]: https://github.com/cypress-io/cypress-grep/actions
[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
