# DevHaven CLI

DevHaven CLI helps you manage your emails, projects, to-do lists, and more within your terminal.

### Setup
This project uses [Bun workspaces](https://bun.sh/guides/install/workspaces) with v1.2.0. 

- [Install bun](https://bun.sh/) before running the following commands.

```sh
# Setup
bun install
bun cli db:migrate
bun cli db:generate
bun cli db:push

# Run
bun cli dev login # an argument is required for now

# Open drizzle studio
bun cli db:studio 
```

