# cypress-grep
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

All other tests will be marked pending, see [Cypress test statuses](https://on.cypress.io/writing-and-organizing-tests#Test-statuses)
