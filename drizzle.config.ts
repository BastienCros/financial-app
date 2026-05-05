import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/lib/db/orm/schema.ts',
    out: './src/lib/db/orm/migrations',
})
