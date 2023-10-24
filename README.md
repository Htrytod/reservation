# reservation

## Tech

- loopback4
- loopback4/graphql
- loopback4/authentication-jwt
- cucumber
- typescript

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```


## Middleware dependencies

Setup mongo on port 27017 (without auth)

or

```
docker run -d -p 27017:27017 --name example-mongo mongo
```

## Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

Try http://127.0.0.1:3000/explorer for rest api.

Try http://127.0.0.1:3000/graphql for graphql api.

## Test with cucumber

Features directory : `src/__tests__/acceptance/features`

Run the following command (need docker cli):

```
npm test-cucumber
```

Test result should be like:

```
........................................

10 scenarios (10 passed)
20 steps (20 passed)
0m06.323s (executing steps: 0m01.095s)
```

## Default Users

| role | email | password |
| ----- | ----- | ----- |
| admin | administrator@example.com | password |
| guest | guest@example.com | password |
| employee | employee@example.com | password |

Login steps:
1. Invoke `/login`
2. Keep JWT token
3. Get userId by `/whoAmI` with token
