#!/usr/bin/env node

import { jsonc } from "jsonc"
import fs from "fs-jetpack"
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"

const configSource = fs.read("simpl.server.jsonc")
if (configSource === undefined) {
    process.exit(1)
}

const config = jsonc.parse(configSource)

const server = new Hono()
server.use(
    async (c, next) => {
        const url = new URL(c.req.url)
        console.log(`[${c.req.method}] ${url.pathname}`)
        return await next()
    }
)
for (const route of config.routes) {
    server.get(
        route.path,
        serveStatic({
            root: route.dir
        })
    )
}

const port = config.port ?? 8080
serve(
    {
        port,
        fetch: server.fetch,
    },
    () => console.log(`Server started on port ${port}`)
)
