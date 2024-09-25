import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'

const BaseResource = z.object({ success: z.boolean() }).passthrough()
const Item = z
  .object({ _id: z.string(), item: z.string(), level: z.number().int() })
  .passthrough()
const Items = BaseResource.and(
  z.object({ items: z.array(Item) }).passthrough(),
)

export const schemas = {
  BaseResource,
  Item,
  Items,
}

const endpoints = makeApi([
  {
    method: 'get',
    path: '/home',
    alias: 'getHome',
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'get',
    path: '/known/kanji',
    alias: 'getKnownkanji',
    requestFormat: 'json',
    response: Items,
  },
  {
    method: 'get',
    path: '/known/vocabulary',
    alias: 'getKnownvocabulary',
    requestFormat: 'json',
    response: Items,
  },
  {
    method: 'get',
    path: '/srs/grammar-lessons',
    alias: 'getSrsgrammarLessons',
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'get',
    path: '/srs/grammar-reviews',
    alias: 'getSrsgrammarReviews',
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'get',
    path: '/srs/lessons',
    alias: 'getSrslessons',
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'get',
    path: '/srs/reviews',
    alias: 'getSrsreviews',
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'get',
    path: '/studylists',
    alias: 'getStudylists',
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'get',
    path: '/studylists/:id',
    alias: 'getStudylistsId',
    description: `Retrieves a specific studylist by its id.`,
    requestFormat: 'json',
    response: z.void(),
  },
  {
    method: 'post',
    path: '/studylists/items/add',
    alias: 'postStudylistsitemsadd',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'post',
    path: '/studylists/items/add/new',
    alias: 'postStudylistsitemsaddnew',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'post',
    path: '/studylists/items/personal',
    alias: 'postStudylistsitemspersonal',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'post',
    path: '/studylists/items/remove',
    alias: 'postStudylistsitemsremove',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'post',
    path: '/studylists/items/suspend',
    alias: 'postStudylistsitemssuspend',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'post',
    path: '/studylists/items/unsuspend',
    alias: 'postStudylistsitemsunsuspend',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().passthrough(),
      },
    ],
    response: z.void(),
  },
])

export const api = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
