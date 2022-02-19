This hook is recommended for use while developing. But not strictly necessary

```
git rev-parse --git-dir && git config core.hooksPath ./.git-hooks || exit 0
```

It can be enabled via the command above by changing your hookPath in the git core config. Please only do this if you know the consequences of it.

Otherwise testing is recommended before making commits using 
```
yarn test
```