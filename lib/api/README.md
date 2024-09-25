# Language APIs

A collection of utilities for using the apis from various language-learning platforms.

Organization of each platform is as so:

### /helpers

These are the main exposed methods, and aim to handle things like caching and permissions under-the-hood. In theory, you should be able to do everything you need to by just using the helpers.

### /api

The raw api requests can be accessed via `/api`. These are meant to be escape mechanisms for if the `/helpers` don't properly handle your usecase. This should be generated client code from spec.

Generate the `mod.ts` code from open-api spec, using [openapi-zod-client](https://github.com/astahmer/openapi-zod-client)

Generate: `openapi-zod-client ./marumori/api/spec.yaml -o './marumori/api/mod.ts'`
