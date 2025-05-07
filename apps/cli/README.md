# @devhaven/cli

```sh
# Setup
bun install
bun run db:migrate
bun run db:generate
bun run db:push

# Run
bun run dev login # an argument is required for now

# Run cli
bun run build
bun link 
bun link haven
haven login

# Run cli from a file
bun run build:file # a file named "haven-cli" will be created
./haven-cli login

# Open drizzle studio
bun run db:studio 
```

## Packages used (or will be xD)
- [commander](https://www.npmjs.com/package/commander)
- [chalk](https://www.npmjs.com/package/chalk)
- [sister ANSI](https://www.npmjs.com/package/sisteransi)
- [log-update](https://www.npmjs.com/package/log-update)
- [execa](https://github.com/sindresorhus/execa)
- [meow](https://www.npmjs.com/package/meow)
- [ni](https://github.com/antfu-collective/ni#readme)
- [ora](https://www.npmjs.com/package/ora): Terminal spinner