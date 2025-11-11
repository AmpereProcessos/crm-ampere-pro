# Entity Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Component Patterns](#component-patterns)
4. [State Management](#state-management)
5. [API Endpoint Patterns](#api-endpoint-patterns)
6. [Frontend Data Fetching](#frontend-data-fetching)
7. [Schema Patterns](#schema-patterns)
8. [Step-by-Step Implementation](#step-by-step-implementation)
9. [Decision Trees](#decision-trees)
10. [New Entity Checklist](#new-entity-checklist)

---

## Overview

This guide establishes standardized patterns for implementing entities in the CRM application. By following these patterns, you ensure:
- **Consistency**: All entities behave predictably
- **Reusability**: Components and hooks are shared across features
- **Type Safety**: Full end-to-end type inference from API to UI
- **Maintainability**: Changes propagate cleanly through the system

### Key Technologies
- **Frontend**: React, TanStack Query, Zod, Axios
- **Backend**: Next.js API Routes, MongoDB
- **Validation**: Zod schemas (shared between frontend and backend)
- **Type Safety**: TypeScript with inferred types from API routes

---

## Architecture Principles

### 1. **Monorepo Type Sharing**
Types are defined once in API routes and reused in the frontend:

```typescript
// API Route (app/api/clients/route.ts)
export type TGetClientsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getPartnerClients>>>;

// Frontend Query (utils/queries/clients.ts)
import type { TGetClientsRouteOutput } from "@/app/api/clients/route";
```

### 2. **Standardized Response Structure**
All GET endpoints return a consistent shape to facilitate type inference:

```typescript
{
  data: {
    default: TEntity[] | undefined,     // For list queries
    byId: TEntity | undefined           // For single entity queries
  },
  message: string
}
```

### 3. **Backend-First Validation**
- All validation happens at the API layer using Zod schemas
- Frontend uses the same schemas for type inference
- State management hooks use Zod schemas for type definitions

### 4. **Composition Over Configuration**
- Reusable components accept callbacks for custom behavior
- State hooks provide granular update functions
- Query hooks include built-in filter management

---

## Component Patterns

### ResponsiveDialogDrawer

The `ResponsiveDialogDrawer` component provides a unified interface for modal/drawer interactions across desktop and mobile.

#### Core Features
- Automatically switches between Dialog (desktop) and Drawer (mobile)
- Built-in loading and error states
- Consistent action button patterns
- Support for primary and secondary actions

#### Usage Example

```typescript
<ResponsiveDialogDrawer
  menuTitle="NOVO CLIENTE"
  menuDescription="Preencha os campos abaixo para criar um novo cliente."
  menuActionButtonText="CRIAR CLIENTE"
  menuCancelButtonText="CANCELAR"
  closeMenu={closeModal}
  actionFunction={() => handleCreateClient(state)}
  actionIsLoading={isPending}
  stateIsLoading={false}
  stateError={error}
  dialogVariant="md"
  drawerVariant="md"
>
  {/* Your form content here */}
</ResponsiveDialogDrawer>
```

#### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `menuTitle` | string | Title displayed in header |
| `menuDescription` | string | Description text under title |
| `menuActionButtonText` | string | Primary action button label |
| `menuSecondaryActionButtonText?` | string | Optional secondary action label |
| `menuCancelButtonText` | string | Cancel button label |
| `actionFunction` | () => void | Primary action handler |
| `secondaryActionFunction?` | () => void | Optional secondary action handler |
| `actionIsLoading` | boolean | Loading state for mutations |
| `stateIsLoading` | boolean | Loading state for data fetching |
| `stateError?` | string \| null | Error message to display |
| `closeMenu` | () => void | Function to close modal |
| `dialogVariant?` | "fit" \| "sm" \| "md" \| "lg" | Desktop size |
| `drawerVariant?` | "fit" \| "sm" \| "md" \| "lg" | Mobile size |

### ResponsiveDialogDrawerSection

Use this component to create organized sections within your modal content.

#### Usage Example

```typescript
<ResponsiveDialogDrawerSection
  sectionTitleText="Informações Gerais"
  sectionTitleIcon={<User className="h-4 w-4" />}
>
  <Input label="Nome" value={state.client.nome} onChange={...} />
  <Input label="Email" value={state.client.email} onChange={...} />
</ResponsiveDialogDrawerSection>
```

#### Visual Structure
```
┌─────────────────────────────────────┐
│ 🎯 Section Title                    │
├─────────────────────────────────────┤
│                                     │
│  [Form Field 1]                     │
│  [Form Field 2]                     │
│  [Form Field 3]                     │
│                                     │
└─────────────────────────────────────┘
```

---

## State Management

### Creating State Hooks

State management hooks provide a clean API for managing complex entity state with nested objects and arrays.

#### Pattern Structure

```typescript
// hooks/use-[entity]-state-hook.tsx
import { useCallback, useState } from "react";
import z from "zod";
import { General[Entity]Schema } from "@/utils/schemas/[entity].schema";

const [Entity]StateSchema = z.object({
  [entity]: General[Entity]Schema,
  // Add file holders if entity has image/file uploads
  [entity]ImageHolder: z.object({
    file: z.instanceof(File).nullable(),
    previewUrl: z.string().nullable(),
  }),
});

export type T[Entity]State = z.infer<typeof [Entity]StateSchema>;

type use[Entity]StateHookParams = {
  initialState: T[Entity]State;
};

export default function use[Entity]StateHook({ initialState }: use[Entity]StateHookParams) {
  const [state, setState] = useState<T[Entity]State>(initialState);

  // Basic update function for top-level properties
  const update[Entity] = useCallback((changes: Partial<T[Entity]State["[entity]"]>) => {
    setState((prev) => ({
      ...prev,
      [entity]: {
        ...prev.[entity],
        ...changes,
      },
    }));
  }, []);

  // File holder update (if applicable)
  const update[Entity]ImageHolder = useCallback((changes: Partial<T[Entity]State["[entity]ImageHolder"]>) => {
    setState((prev) => ({
      ...prev,
      [entity]ImageHolder: {
        ...prev.[entity]ImageHolder,
        ...changes,
      },
    }));
  }, []);

  // Array manipulation functions (if entity has arrays)
  const add[Entity]Item = useCallback((newItem: T[Entity]State["[entity]"]["items"][number]) => {
    setState((prev) => ({
      ...prev,
      [entity]: {
        ...prev.[entity],
        items: [...prev.[entity].items, newItem],
      },
    }));
  }, []);

  const update[Entity]Item = useCallback((index: number, changes: Partial<T[Entity]State["[entity]"]["items"][number]>) => {
    setState((prev) => ({
      ...prev,
      [entity]: {
        ...prev.[entity],
        items: prev.[entity].items.map((item, i) => (i === index ? { ...item, ...changes } : item)),
      },
    }));
  }, []);

  const remove[Entity]Item = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      [entity]: {
        ...prev.[entity],
        items: prev.[entity].items.filter((_, i) => i !== index),
      },
    }));
  }, []);

  // Utility functions
  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  const redefineState = useCallback((newState: T[Entity]State) => {
    setState(newState);
  }, []);

  return {
    state,
    update[Entity],
    update[Entity]ImageHolder, // if applicable
    add[Entity]Item,           // if applicable
    update[Entity]Item,        // if applicable
    remove[Entity]Item,        // if applicable
    resetState,
    redefineState,
  };
}

export type TUse[Entity]StateHook = ReturnType<typeof use[Entity]StateHook>;
```

#### When to Include File Holders

Include file/image holders when your entity schema has URL fields for uploaded files:

```typescript
// ✅ Include holder - entity has image URL
const ClientSchema = z.object({
  nome: z.string(),
  conecta: z.object({
    avatar_url: z.string().nullable(),
  }),
});

// ✅ Include holder - entity has file URL
const KitSchema = z.object({
  nome: z.string(),
  imagemCapaUrl: z.string().nullable(),
});

// ❌ No holder needed - no file/image fields
const GoalSchema = z.object({
  nome: z.string(),
  valor: z.number(),
});
```

---

## API Endpoint Patterns

### File Structure

```
app/api/[entity]/
├── route.ts          # CRUD handlers (GET, POST, PUT, DELETE)
├── input.ts          # Zod input validation schemas
└── [nested]/
    └── route.ts      # Nested/related resources
```

### Standard Route Implementation

#### GET Endpoint (with filtering)

```typescript
// app/api/[entity]/route.ts
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TEntity } from "@/utils/schemas/[entity].schema";
import createHttpError from "http-errors";
import { ObjectId, type Filter } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import type z from "zod";
import { GetEntityInputSchema } from "./input";

// Type exports for frontend
export type TGetEntityInput = z.infer<typeof GetEntityInputSchema>;

async function getEntity({ input, session }: { input: TGetEntityInput; session: TUserSession }) {
  const PAGE_SIZE = 50;
  const db = await connectToDatabase();
  const entityCollection = db.collection<TEntity>("[entities]");

  // Handle single entity by ID
  if ("id" in input) {
    const entity = await entityCollection.findOne({ _id: new ObjectId(input.id) });
    if (!entity) {
      throw new createHttpError.NotFound("Entidade não encontrada.");
    }
    return {
      data: {
        default: undefined,
        byId: { ...entity, _id: entity._id.toString() },
      },
      message: "Entidade encontrada com sucesso!",
    };
  }

  // Handle list with filters
  const { page, search, periodAfter, periodBefore, filters } = input;

  // Build query filters
  const searchQuery: Filter<TEntity> | null = search
    ? {
        $or: [
          { nome: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : null;

  const periodQuery: Filter<TEntity> | null = 
    periodAfter && periodBefore 
      ? { dataInsercao: { $gte: periodAfter, $lte: periodBefore } } 
      : null;

  const filtersQuery: Filter<TEntity> | null = 
    filters && filters.length > 0 
      ? { filterId: { $in: filters } } 
      : null;

  // Combine queries
  const queryArray = [searchQuery, periodQuery, filtersQuery].filter((q) => !!q);
  const query: Filter<TEntity> = queryArray.length > 0 ? { $and: queryArray } : {};

  // Pagination
  const skip = PAGE_SIZE * (Number(page) - 1);
  const limit = PAGE_SIZE;

  const entitiesMatched = await entityCollection.countDocuments(query);
  const entities = (await entityCollection.find(query).skip(skip).limit(limit).toArray())
    .map((entity) => ({ ...entity, _id: entity._id.toString() }));

  const totalPages = Math.ceil(entitiesMatched / PAGE_SIZE);

  return {
    data: {
      default: {
        entities,
        entitiesMatched,
        totalPages,
      },
      byId: undefined,
    },
    message: "Entidades encontradas com sucesso!",
  };
}

// Export types for frontend consumption
export type TGetEntityOutput = Awaited<ReturnType<typeof getEntity>>;
export type TGetEntityOutputDefault = Exclude<TGetEntityOutput["data"]["default"], undefined>;
export type TGetEntityOutputById = Exclude<TGetEntityOutput["data"]["byId"], undefined>;

const getEntityHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const searchParams = req.nextUrl.searchParams;
  const input = GetEntityInputSchema.parse({
    id: searchParams.get("id"),
    page: searchParams.get("page"),
    search: searchParams.get("search"),
    periodAfter: searchParams.get("periodAfter"),
    periodBefore: searchParams.get("periodBefore"),
    filters: searchParams.get("filters"),
  });
  const result = await getEntity({ input, session });
  return NextResponse.json(result);
};

export const GET = apiHandler({ GET: getEntityHandler });
```

#### POST Endpoint

```typescript
export type TCreateEntityInput = z.infer<typeof CreateEntityInputSchema>;

async function createEntity({ input, session }: { input: TCreateEntityInput; session: TUserSession }) {
  // Optional: Permission check
  if (!session.user.permissoes.entities.criar) {
    throw new createHttpError.Forbidden("Você não tem permissão para criar entidades.");
  }

  const db = await connectToDatabase();
  const entityCollection = db.collection<TEntity>("[entities]");

  const insertResponse = await entityCollection.insertOne(input.entity);
  if (!insertResponse.acknowledged) {
    throw new createHttpError.InternalServerError("Erro ao criar entidade.");
  }

  return {
    data: { insertedId: insertResponse.insertedId.toString() },
    message: "Entidade criada com sucesso!",
  };
}

export type TCreateEntityOutput = Awaited<ReturnType<typeof createEntity>>;

const createEntityHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const payload = await req.json();
  const input = CreateEntityInputSchema.parse(payload);
  const result = await createEntity({ input, session });
  return NextResponse.json(result);
};

export const POST = apiHandler({ POST: createEntityHandler });
```

#### PUT Endpoint

```typescript
export type TUpdateEntityInput = z.infer<typeof UpdateEntityInputSchema>;

async function updateEntity({ input, session }: { input: TUpdateEntityInput; session: TUserSession }) {
  // Optional: Permission check
  if (!session.user.permissoes.entities.editar) {
    throw new createHttpError.Forbidden("Você não tem permissão para atualizar entidades.");
  }

  const db = await connectToDatabase();
  const entityCollection = db.collection<TEntity>("[entities]");

  const updateResponse = await entityCollection.updateOne(
    { _id: new ObjectId(input.id) },
    { $set: input.changes }
  );

  if (!updateResponse.acknowledged) {
    throw new createHttpError.InternalServerError("Erro ao atualizar entidade.");
  }

  return {
    data: { updatedId: updateResponse.upsertedId?.toString() },
    message: "Entidade atualizada com sucesso!",
  };
}

export type TUpdateEntityOutput = Awaited<ReturnType<typeof updateEntity>>;

const updateEntityHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const payload = await req.json();
  const input = UpdateEntityInputSchema.parse(payload);
  const result = await updateEntity({ input, session });
  return NextResponse.json(result);
};

export const PUT = apiHandler({ PUT: updateEntityHandler });
```

### Input Validation Schemas

```typescript
// app/api/[entity]/input.ts
import z from "zod";
import { General[Entity]Schema } from "@/utils/schemas/[entity].schema";

// GET - List with filters
export const GetMany[Entity]InputSchema = z.object({
  page: z.coerce.number().default(1),
  search: z.string().nullable().default(null),
  periodAfter: z.string().datetime().nullable().default(null),
  periodBefore: z.string().datetime().nullable().default(null),
  // Transform comma-separated string to array
  filters: z
    .string()
    .nullable()
    .default(null)
    .transform((val) => (val ? val.split(",") : null)),
  // More filters as needed...
});

// GET - Single by ID
export const Get[Entity]ByIdInputSchema = z.object({
  id: z.string(),
});

// Combined GET input
export const Get[Entity]InputSchema = z.union([
  Get[Entity]ByIdInputSchema,
  GetMany[Entity]InputSchema,
]);

// POST
export const CreateOne[Entity]InputSchema = z.object({
  type: z.literal("single"),
  entity: General[Entity]Schema,
});

export const CreateMany[Entity]InputSchema = z.object({
  type: z.literal("multiple"),
  entities: z.array(General[Entity]Schema),
});

export const Create[Entity]InputSchema = z.discriminatedUnion("type", [
  CreateOne[Entity]InputSchema,
  CreateMany[Entity]InputSchema,
]);

// PUT
export const Update[Entity]InputSchema = z.object({
  id: z.string(),
  changes: General[Entity]Schema.partial(),
});
```

### Query String Array/Object Handling

Use Zod transforms to handle comma-separated values:

```typescript
// Input: "?ids=1,2,3"
// Schema:
const InputSchema = z.object({
  ids: z
    .string()
    .nullable()
    .default(null)
    .transform((val) => (val ? val.split(",") : null)),
});
// Output: { ids: ["1", "2", "3"] }

// Input: "?active=true"
// Schema:
const InputSchema = z.object({
  active: z
    .string()
    .nullable()
    .default(null)
    .transform((val) => val === "true"),
});
// Output: { active: true }
```

### Permission Checks (Suggested Pattern)

```typescript
// Suggested, not required for all endpoints
async function someProtectedRoute(request: NextRequest) {
  const { user } = await getValidCurrentSessionUncached();

  // Check specific permission
  if (!user.permissoes.[resource].[action]) {
    throw new createHttpError.Forbidden("Você não tem permissão para esta ação.");
  }

  // Check scope-based access
  const userScope = user.permissoes.[resource].escopo;
  if (userScope && !userScope.includes(targetUserId)) {
    throw new createHttpError.Forbidden("Seu escopo não contempla este recurso.");
  }

  // Proceed with route logic...
}
```

---

## Frontend Data Fetching

### Query Hooks Structure

All query hooks follow a consistent pattern with built-in state management for filters.

#### List Query with Filters

```typescript
// utils/queries/[entities].ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import type { TGetEntityOutput, TGetManyEntityInput } from "@/app/api/[entity]/route";
import { useDebounceMemo } from "@/lib/hooks";

async function fetchEntities(input: TGetManyEntityInput) {
  const queryString = new URLSearchParams();
  
  // Add non-null parameters to query string
  if (input.search && input.search.trim().length > 0) {
    queryString.set("search", input.search);
  }
  if (input.periodAfter) queryString.set("periodAfter", input.periodAfter);
  if (input.periodBefore) queryString.set("periodBefore", input.periodBefore);
  if (input.page) queryString.set("page", input.page.toString());
  
  // Handle arrays
  if (input.filters && input.filters.length > 0) {
    queryString.set("filters", input.filters.join(","));
  }

  const { data } = await axios.get<TGetEntityOutput>(`/api/[entity]?${queryString.toString()}`);
  if (!data.data.default) throw new Error("Entidades não encontradas.");
  return data.data.default;
}

type TUseEntitiesParams = {
  initialFilters?: TGetManyEntityInput;
};

export function useEntities({ initialFilters }: TUseEntitiesParams = {}) {
  const [filters, setFilters] = useState<TGetManyEntityInput>({
    page: initialFilters?.page ?? 1,
    search: initialFilters?.search ?? null,
    periodAfter: initialFilters?.periodAfter ?? null,
    periodBefore: initialFilters?.periodBefore ?? null,
    filters: initialFilters?.filters ?? null,
  });

  function updateFilters(newFilters: Partial<TGetManyEntityInput>) {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }

  const debouncedFilters = useDebounceMemo(filters, 500);

  return {
    ...useQuery({
      queryKey: ["entities", debouncedFilters],
      queryFn: () => fetchEntities(debouncedFilters),
    }),
    queryKey: ["entities", debouncedFilters],
    filters,
    updateFilters,
  };
}
```

#### Single Entity Query

```typescript
async function fetchEntityById({ id }: { id: string }) {
  const { data } = await axios.get<TGetEntityOutput>(`/api/[entity]?id=${id}`);
  if (!data.data.byId) throw new Error("Entidade não encontrada.");
  return data.data.byId;
}

type TUseEntityByIdParams = {
  id: string;
};

export function useEntityById({ id }: TUseEntityByIdParams) {
  return {
    ...useQuery({
      queryKey: ["entity-by-id", id],
      queryFn: () => fetchEntityById({ id }),
    }),
    queryKey: ["entity-by-id", id],
  };
}
```

### Mutation Patterns

#### Create Mutation

```typescript
// utils/mutations/[entities].ts
import axios from "axios";
import type { TCreateEntityInput, TCreateEntityOutput } from "@/app/api/[entity]/route";

export async function createEntity({ info }: { info: TCreateEntityInput }) {
  const { data } = await axios.post<TCreateEntityOutput>("/api/[entity]", info);
  return data.message;
}
```

#### Update Mutation

```typescript
export async function updateEntity({ id, changes }: { id: string; changes: Partial<TEntity> }) {
  const { data } = await axios.put<TUpdateEntityOutput>(`/api/[entity]?id=${id}`, changes);
  return data.message;
}
```

### Using Mutations in Modals

```typescript
const {
  mutate: handleCreateEntityMutation,
  isPending,
} = useMutation({
  mutationKey: ["create-entity"],
  mutationFn: handleCreateEntityFn,
  onMutate: async () => {
    if (callbacks?.onMutate) callbacks.onMutate();
  },
  onSuccess: async (data) => {
    if (callbacks?.onSuccess) callbacks.onSuccess();
    return toast.success(data);
  },
  onError: async (error) => {
    if (callbacks?.onError) callbacks.onError(error);
  },
  onSettled: async () => {
    if (callbacks?.onSettled) callbacks.onSettled();
  },
});
```

---

## Schema Patterns

### Entity Schema Structure

```typescript
// utils/schemas/[entity].schema.ts
import { z } from "zod";
import { AuthorSchema } from "./user.schema";

export const General[Entity]Schema = z.object({
  // Required fields
  nome: z
    .string({
      required_error: "Nome não informado.",
      invalid_type_error: "Tipo não válido para nome.",
    })
    .min(3, "Nome deve ter ao menos 3 caracteres."),
  
  // Reference fields
  idParceiro: z.string({
    required_error: "Parceiro não informado.",
    invalid_type_error: "Tipo não válido para parceiro.",
  }),

  // Optional fields
  email: z
    .string({
      invalid_type_error: "Tipo não válido para email.",
    })
    .email("Email inválido.")
    .optional()
    .nullable(),

  // Nested objects
  configuracoes: z.object({
    ativo: z.boolean(),
    valor: z.number(),
  }).optional().nullable(),

  // Arrays
  tags: z.array(z.string()).default([]),

  // Dates (always ISO strings)
  dataInsercao: z
    .string({
      required_error: "Data de inserção não informada.",
    })
    .datetime(),

  // Author metadata
  autor: AuthorSchema,
});

export type TEntity = z.infer<typeof General[Entity]Schema>;

// DTO with MongoDB ID
export type TEntityDTO = TEntity & { _id: string };

// Simplified projections (if needed)
export type TEntitySimplified = Pick<TEntity, "nome" | "email" | "dataInsercao">;
export type TEntityDTOSimplified = TEntitySimplified & { _id: string };
```

---

## Step-by-Step Implementation

### Adding a New Entity: Complete Walkthrough

Let's walk through adding a "Product" entity from scratch.

#### Step 1: Define the Schema

```typescript
// utils/schemas/product.schema.ts
import { z } from "zod";
import { AuthorSchema } from "./user.schema";

export const GeneralProductSchema = z.object({
  nome: z
    .string({
      required_error: "Nome do produto não informado.",
      invalid_type_error: "Tipo não válido para nome do produto.",
    })
    .min(3, "Nome deve ter ao menos 3 caracteres."),
  
  descricao: z
    .string({
      invalid_type_error: "Tipo não válido para descrição.",
    })
    .optional()
    .nullable(),
  
  preco: z.number({
    required_error: "Preço não informado.",
    invalid_type_error: "Tipo não válido para preço.",
  }).min(0, "Preço deve ser maior que zero."),
  
  imagemUrl: z
    .string({
      invalid_type_error: "Tipo não válido para URL da imagem.",
    })
    .optional()
    .nullable(),
  
  categoria: z.enum(["ELETRONICO", "SERVICO", "OUTROS"], {
    required_error: "Categoria não informada.",
  }),
  
  ativo: z.boolean().default(true),
  
  autor: AuthorSchema,
  dataInsercao: z.string().datetime(),
});

export type TProduct = z.infer<typeof GeneralProductSchema>;
export type TProductDTO = TProduct & { _id: string };
```

#### Step 2: Create API Input Schemas

```typescript
// app/api/products/input.ts
import z from "zod";
import { GeneralProductSchema } from "@/utils/schemas/product.schema";

export const GetManyProductsInputSchema = z.object({
  page: z.coerce.number().default(1),
  search: z.string().nullable().default(null),
  categoria: z
    .string()
    .nullable()
    .default(null)
    .transform((val) => (val ? val.split(",") : null)),
  ativo: z
    .string()
    .nullable()
    .default(null)
    .transform((val) => (val === "true" ? true : val === "false" ? false : null)),
});

export const GetProductByIdInputSchema = z.object({
  id: z.string(),
});

export const GetProductsInputSchema = z.union([
  GetProductByIdInputSchema,
  GetManyProductsInputSchema,
]);

export const CreateProductInputSchema = z.object({
  product: GeneralProductSchema,
});

export const UpdateProductInputSchema = z.object({
  id: z.string(),
  changes: GeneralProductSchema.partial(),
});
```

#### Step 3: Create API Route

```typescript
// app/api/products/route.ts
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TProduct } from "@/utils/schemas/product.schema";
import createHttpError from "http-errors";
import { ObjectId, type Filter } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import type z from "zod";
import {
  GetProductsInputSchema,
  type GetManyProductsInputSchema,
  type GetProductByIdInputSchema,
  CreateProductInputSchema,
  UpdateProductInputSchema,
} from "./input";

// GET Implementation
export type TGetProductsInput = z.infer<typeof GetProductsInputSchema>;
export type TGetManyProductsInput = z.infer<typeof GetManyProductsInputSchema>;
export type TGetProductByIdInput = z.infer<typeof GetProductByIdInputSchema>;

async function getProducts({ input, session }: { input: TGetProductsInput; session: TUserSession }) {
  const PAGE_SIZE = 50;
  const db = await connectToDatabase();
  const productsCollection = db.collection<TProduct>("products");

  if ("id" in input) {
    const product = await productsCollection.findOne({ _id: new ObjectId(input.id) });
    if (!product) {
      throw new createHttpError.NotFound("Produto não encontrado.");
    }
    return {
      data: {
        default: undefined,
        byId: { ...product, _id: product._id.toString() },
      },
      message: "Produto encontrado com sucesso!",
    };
  }

  const { page, search, categoria, ativo } = input;

  const searchQuery: Filter<TProduct> | null = search
    ? { nome: { $regex: search, $options: "i" } }
    : null;

  const categoriaQuery: Filter<TProduct> | null = 
    categoria && categoria.length > 0 
      ? { categoria: { $in: categoria } } 
      : null;

  const ativoQuery: Filter<TProduct> | null = 
    ativo !== null 
      ? { ativo } 
      : null;

  const queryArray = [searchQuery, categoriaQuery, ativoQuery].filter((q) => !!q);
  const query: Filter<TProduct> = queryArray.length > 0 ? { $and: queryArray } : {};

  const skip = PAGE_SIZE * (Number(page) - 1);
  const limit = PAGE_SIZE;

  const productsMatched = await productsCollection.countDocuments(query);
  const products = (await productsCollection.find(query).skip(skip).limit(limit).toArray())
    .map((product) => ({ ...product, _id: product._id.toString() }));

  const totalPages = Math.ceil(productsMatched / PAGE_SIZE);

  return {
    data: {
      default: {
        products,
        productsMatched,
        totalPages,
      },
      byId: undefined,
    },
    message: "Produtos encontrados com sucesso!",
  };
}

export type TGetProductsOutput = Awaited<ReturnType<typeof getProducts>>;
export type TGetProductsOutputDefault = Exclude<TGetProductsOutput["data"]["default"], undefined>;
export type TGetProductsOutputById = Exclude<TGetProductsOutput["data"]["byId"], undefined>;

const getProductsHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const searchParams = req.nextUrl.searchParams;
  const input = GetProductsInputSchema.parse({
    id: searchParams.get("id"),
    page: searchParams.get("page"),
    search: searchParams.get("search"),
    categoria: searchParams.get("categoria"),
    ativo: searchParams.get("ativo"),
  });
  const result = await getProducts({ input, session });
  return NextResponse.json(result);
};

export const GET = apiHandler({ GET: getProductsHandler });

// POST Implementation
export type TCreateProductInput = z.infer<typeof CreateProductInputSchema>;

async function createProduct({ input, session }: { input: TCreateProductInput; session: TUserSession }) {
  const db = await connectToDatabase();
  const productsCollection = db.collection<TProduct>("products");

  const insertResponse = await productsCollection.insertOne(input.product);
  if (!insertResponse.acknowledged) {
    throw new createHttpError.InternalServerError("Erro ao criar produto.");
  }

  return {
    data: { insertedId: insertResponse.insertedId.toString() },
    message: "Produto criado com sucesso!",
  };
}

export type TCreateProductOutput = Awaited<ReturnType<typeof createProduct>>;

const createProductHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const payload = await req.json();
  const input = CreateProductInputSchema.parse(payload);
  const result = await createProduct({ input, session });
  return NextResponse.json(result);
};

export const POST = apiHandler({ POST: createProductHandler });

// PUT Implementation
export type TUpdateProductInput = z.infer<typeof UpdateProductInputSchema>;

async function updateProduct({ input, session }: { input: TUpdateProductInput; session: TUserSession }) {
  const db = await connectToDatabase();
  const productsCollection = db.collection<TProduct>("products");

  const updateResponse = await productsCollection.updateOne(
    { _id: new ObjectId(input.id) },
    { $set: input.changes }
  );

  if (!updateResponse.acknowledged) {
    throw new createHttpError.InternalServerError("Erro ao atualizar produto.");
  }

  return {
    data: { updatedId: updateResponse.upsertedId?.toString() },
    message: "Produto atualizado com sucesso!",
  };
}

export type TUpdateProductOutput = Awaited<ReturnType<typeof updateProduct>>;

const updateProductHandler = async (req: NextRequest) => {
  const session = await getValidCurrentSessionUncached();
  const payload = await req.json();
  const input = UpdateProductInputSchema.parse(payload);
  const result = await updateProduct({ input, session });
  return NextResponse.json(result);
};

export const PUT = apiHandler({ PUT: updateProductHandler });
```

#### Step 4: Create Query Hooks

```typescript
// utils/queries/products.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import type { TGetProductsOutput, TGetManyProductsInput } from "@/app/api/products/route";
import { useDebounceMemo } from "@/lib/hooks";

async function fetchProducts(input: TGetManyProductsInput) {
  const queryString = new URLSearchParams();
  if (input.search && input.search.trim().length > 0) {
    queryString.set("search", input.search);
  }
  if (input.page) queryString.set("page", input.page.toString());
  if (input.categoria && input.categoria.length > 0) {
    queryString.set("categoria", input.categoria.join(","));
  }
  if (input.ativo !== null) {
    queryString.set("ativo", input.ativo.toString());
  }

  const { data } = await axios.get<TGetProductsOutput>(`/api/products?${queryString.toString()}`);
  if (!data.data.default) throw new Error("Produtos não encontrados.");
  return data.data.default;
}

type TUseProductsParams = {
  initialFilters?: TGetManyProductsInput;
};

export function useProducts({ initialFilters }: TUseProductsParams = {}) {
  const [filters, setFilters] = useState<TGetManyProductsInput>({
    page: initialFilters?.page ?? 1,
    search: initialFilters?.search ?? null,
    categoria: initialFilters?.categoria ?? null,
    ativo: initialFilters?.ativo ?? null,
  });

  function updateFilters(newFilters: Partial<TGetManyProductsInput>) {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }

  const debouncedFilters = useDebounceMemo(filters, 500);

  return {
    ...useQuery({
      queryKey: ["products", debouncedFilters],
      queryFn: () => fetchProducts(debouncedFilters),
    }),
    queryKey: ["products", debouncedFilters],
    filters,
    updateFilters,
  };
}

async function fetchProductById({ id }: { id: string }) {
  const { data } = await axios.get<TGetProductsOutput>(`/api/products?id=${id}`);
  if (!data.data.byId) throw new Error("Produto não encontrado.");
  return data.data.byId;
}

type TUseProductByIdParams = {
  id: string;
};

export function useProductById({ id }: TUseProductByIdParams) {
  return {
    ...useQuery({
      queryKey: ["product-by-id", id],
      queryFn: () => fetchProductById({ id }),
    }),
    queryKey: ["product-by-id", id],
  };
}
```

#### Step 5: Create Mutation Functions

```typescript
// utils/mutations/products.ts
import axios from "axios";
import type { 
  TCreateProductInput, 
  TCreateProductOutput,
  TUpdateProductInput,
  TUpdateProductOutput 
} from "@/app/api/products/route";

export async function createProduct({ info }: { info: TCreateProductInput }) {
  const { data } = await axios.post<TCreateProductOutput>("/api/products", info);
  return data.message;
}

export async function updateProduct({ id, changes }: { id: string; changes: TUpdateProductInput["changes"] }) {
  const { data } = await axios.put<TUpdateProductOutput>(`/api/products?id=${id}`, changes);
  return data.message;
}
```

#### Step 6: Create State Hook

```typescript
// hooks/use-product-state-hook.tsx
import { useCallback, useState } from "react";
import z from "zod";
import { GeneralProductSchema } from "@/utils/schemas/product.schema";

const ProductStateSchema = z.object({
  product: GeneralProductSchema,
  productImageHolder: z.object({
    file: z.instanceof(File).nullable(),
    previewUrl: z.string().nullable(),
  }),
});

export type TProductState = z.infer<typeof ProductStateSchema>;

type useProductStateHookParams = {
  initialState: TProductState;
};

export default function useProductStateHook({ initialState }: useProductStateHookParams) {
  const [state, setState] = useState<TProductState>(initialState);

  const updateProduct = useCallback((changes: Partial<TProductState["product"]>) => {
    setState((prev) => ({
      ...prev,
      product: {
        ...prev.product,
        ...changes,
      },
    }));
  }, []);

  const updateProductImageHolder = useCallback((changes: Partial<TProductState["productImageHolder"]>) => {
    setState((prev) => ({
      ...prev,
      productImageHolder: {
        ...prev.productImageHolder,
        ...changes,
      },
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  const redefineState = useCallback((newState: TProductState) => {
    setState(newState);
  }, []);

  return {
    state,
    updateProduct,
    updateProductImageHolder,
    resetState,
    redefineState,
  };
}

export type TUseProductStateHook = ReturnType<typeof useProductStateHook>;
```

#### Step 7: Create Modal Components

```typescript
// components/Modals/Product/NewProduct.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useProductStateHook, { type TUseProductStateHook } from "@/hooks/use-product-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { uploadFile } from "@/lib/methods/firebase";
import { createProduct } from "@/utils/mutations/products";
import ProductGeneralBlock from "./Blocks/General";

type NewProductModalProps = {
  session: TUserSession;
  closeModal: () => void;
  callbacks?: {
    onMutate?: () => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  };
};

function NewProduct({ session, closeModal, callbacks }: NewProductModalProps) {
  const queryClient = useQueryClient();

  const { state, updateProduct, updateProductImageHolder, resetState, redefineState } = useProductStateHook({
    initialState: {
      product: {
        nome: "",
        descricao: null,
        preco: 0,
        imagemUrl: null,
        categoria: "OUTROS",
        ativo: true,
        autor: {
          id: session.user.id,
          nome: session.user.nome,
          avatar_url: session.user.avatar_url,
        },
        dataInsercao: new Date().toISOString(),
      },
      productImageHolder: {
        file: null,
        previewUrl: null,
      },
    },
  });

  async function handleCreateProduct(state: TUseProductStateHook["state"]) {
    let productImageUrl = state.product.imagemUrl;

    if (state.productImageHolder.file) {
      const fileName = `product_${state.product.nome.toLowerCase().replaceAll(" ", "_")}`;
      const { url } = await uploadFile({ 
        file: state.productImageHolder.file, 
        fileName: fileName, 
        vinculationId: session.user.idParceiro || "" 
      });
      productImageUrl = url;
    }

    return await createProduct({
      info: {
        product: {
          ...state.product,
          imagemUrl: productImageUrl,
        },
      },
    });
  }

  const {
    data: mutationData,
    mutate: handleCreateProductMutation,
    reset: resetMutation,
    isPending,
  } = useMutation({
    mutationKey: ["create-product"],
    mutationFn: handleCreateProduct,
    onMutate: async () => {
      if (callbacks?.onMutate) callbacks.onMutate();
    },
    onSuccess: async (data) => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      return toast.success(data);
    },
    onError: async (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
    onSettled: async () => {
      if (callbacks?.onSettled) callbacks.onSettled();
    },
  });

  return (
    <ResponsiveDialogDrawer
      menuTitle="NOVO PRODUTO"
      menuDescription="Preencha os campos abaixo para criar um novo produto."
      menuActionButtonText="CRIAR PRODUTO"
      menuCancelButtonText="CANCELAR"
      closeMenu={closeModal}
      actionFunction={() => handleCreateProductMutation(state)}
      actionIsLoading={isPending}
      stateIsLoading={false}
      dialogVariant="md"
      drawerVariant="md"
    >
      {mutationData ? (
        <div className="flex w-full grow flex-col items-center justify-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <BadgeCheck className="h-10 min-h-10 w-10 min-w-10 text-green-500 lg:h-20 lg:w-20" />
            <h1 className="text-center font-bold text-lg text-primary tracking-tight">
              Produto criado com sucesso!
            </h1>
          </div>
          <div className="flex flex-col items-center gap-2 lg:flex-row">
            <Button
              onClick={() => {
                resetState();
                resetMutation();
              }}
              variant="secondary"
            >
              NOVO PRODUTO
            </Button>
          </div>
        </div>
      ) : (
        <ProductGeneralBlock
          infoHolder={state.product}
          updateInfoHolder={updateProduct}
          imageHolder={state.productImageHolder}
          updateImageHolder={updateProductImageHolder}
        />
      )}
    </ResponsiveDialogDrawer>
  );
}

export default NewProduct;
```

```typescript
// components/Modals/Product/EditProduct.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useProductStateHook, { type TUseProductStateHook } from "@/hooks/use-product-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { uploadFile } from "@/lib/methods/firebase";
import { updateProduct as updateProductMutation } from "@/utils/mutations/products";
import { useProductById } from "@/utils/queries/products";
import ProductGeneralBlock from "./Blocks/General";

type EditProductModalProps = {
  productId: string;
  session: TUserSession;
  closeModal: () => void;
  callbacks?: {
    onMutate?: () => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  };
};

function EditProduct({ productId, session, closeModal, callbacks }: EditProductModalProps) {
  const queryClient = useQueryClient();
  const { data: product, queryKey, isError, isLoading, error } = useProductById({ id: productId });

  const { state, updateProduct, updateProductImageHolder, redefineState } = useProductStateHook({
    initialState: {
      product: {
        nome: "",
        descricao: null,
        preco: 0,
        imagemUrl: null,
        categoria: "OUTROS",
        ativo: true,
        autor: {
          id: session.user.id,
          nome: session.user.nome,
          avatar_url: session.user.avatar_url,
        },
        dataInsercao: new Date().toISOString(),
      },
      productImageHolder: {
        file: null,
        previewUrl: null,
      },
    },
  });

  async function handleUpdateProduct(state: TUseProductStateHook["state"]) {
    let productImageUrl = state.product.imagemUrl;
    
    if (state.productImageHolder.file) {
      const fileName = `product_${state.product.nome.toLowerCase().replaceAll(" ", "_")}`;
      const { url } = await uploadFile({ 
        file: state.productImageHolder.file, 
        fileName: fileName, 
        vinculationId: session.user.idParceiro || "" 
      });
      productImageUrl = url;
    }
    
    return await updateProductMutation({
      id: productId,
      changes: {
        ...state.product,
        imagemUrl: productImageUrl,
      },
    });
  }

  const { mutate: handleUpdateProductMutation, isPending } = useMutation({
    mutationKey: ["update-product", productId],
    mutationFn: handleUpdateProduct,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKey });
      if (callbacks?.onMutate) callbacks.onMutate();
    },
    onSuccess: async (data) => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      return toast.success(data);
    },
    onError: async (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
    onSettled: async () => {
      if (callbacks?.onSettled) callbacks.onSettled();
      await queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  useEffect(() => {
    if (product) {
      redefineState({ 
        product: product, 
        productImageHolder: { file: null, previewUrl: null } 
      });
    }
  }, [product, redefineState]);

  return (
    <ResponsiveDialogDrawer
      menuTitle="EDITAR PRODUTO"
      menuDescription="Preencha os campos abaixo para atualizar o produto."
      menuActionButtonText="ATUALIZAR PRODUTO"
      menuCancelButtonText="CANCELAR"
      closeMenu={closeModal}
      actionFunction={() => handleUpdateProductMutation(state)}
      actionIsLoading={isPending}
      stateIsLoading={isLoading}
      stateError={isError ? getErrorMessage(error) : null}
      dialogVariant="md"
      drawerVariant="md"
    >
      <ProductGeneralBlock
        infoHolder={state.product}
        updateInfoHolder={updateProduct}
        imageHolder={state.productImageHolder}
        updateImageHolder={updateProductImageHolder}
      />
    </ResponsiveDialogDrawer>
  );
}

export default EditProduct;
```

---

## Decision Trees

### Should I Create a State Hook?

```
Does the entity have a create/edit modal?
├─ YES → Does it have 3+ form fields?
│         ├─ YES → Create state hook
│         └─ NO → Use local useState
└─ NO → No state hook needed
```

### Should I Include File Holders?

```
Does the entity schema have image/file URL fields?
├─ YES → Include holder in state
│         (e.g., avatarHolder, imageHolder)
└─ NO → No file holder needed
```

### Should I Use { default, byId } Response Pattern?

```
Is this a GET endpoint?
├─ YES → Use standardized pattern
│         data: { default: [], byId: {} }
└─ NO → Use simple response
         data: { insertedId } or { success: true }
```

### Should I Add Built-in Filter Management?

```
Does the endpoint accept query parameters?
├─ YES → Add useState + updateFilters
└─ NO → Simple query hook without filters
```

### Should I Add Permission Checks?

```
Is the resource sensitive or user-scoped?
├─ YES → Add permission check
│         if (!user.permissoes.[resource].[action]) throw Forbidden
└─ NO → Public endpoint (analytics, stats, etc.)
```

---

## New Entity Checklist

Use this checklist when implementing a new entity from scratch.

### 1. Schema Definition
- [ ] Create schema file: `utils/schemas/[entity].schema.ts`
- [ ] Define main schema with Zod
- [ ] Export base type: `TEntity`
- [ ] Export DTO type: `TEntityDTO` (with `_id: string`)
- [ ] Export simplified types if needed
- [ ] Define projection objects for MongoDB if needed

### 2. API Endpoints
- [ ] Create route file: `app/api/[entity]/route.ts`
- [ ] Create input file: `app/api/[entity]/input.ts`
- [ ] Implement GET handler
  - [ ] Support byId query
  - [ ] Support list query with filters
  - [ ] Export input types
  - [ ] Export output types
  - [ ] Handle pagination
- [ ] Implement POST handler
  - [ ] Validate input
  - [ ] Handle unique constraints
  - [ ] Export input/output types
- [ ] Implement PUT handler
  - [ ] Validate input
  - [ ] Handle partial updates
  - [ ] Export input/output types
- [ ] Add permission checks (if applicable)

### 3. Frontend Queries
- [ ] Create query file: `utils/queries/[entities].ts`
- [ ] Implement list query hook with filters
  - [ ] useState for filters
  - [ ] updateFilters function
  - [ ] Debounced filters
  - [ ] Query string builder
  - [ ] Return queryKey
- [ ] Implement byId query hook
  - [ ] Return queryKey

### 4. Frontend Mutations
- [ ] Create mutation file: `utils/mutations/[entities].ts`
- [ ] Implement create mutation
- [ ] Implement update mutation
- [ ] Implement delete mutation (if applicable)

### 5. State Management Hook (if needed)
- [ ] Create hook file: `hooks/use-[entity]-state-hook.tsx`
- [ ] Define state schema with Zod
- [ ] Export state type
- [ ] Implement update functions
- [ ] Implement file holder functions (if applicable)
- [ ] Implement array manipulation functions (if applicable)
- [ ] Implement resetState
- [ ] Implement redefineState
- [ ] Export hook return type

### 6. Modal Components
- [ ] Create modal folder: `components/Modals/[Entity]/`
- [ ] Create New[Entity].tsx
  - [ ] Use ResponsiveDialogDrawer
  - [ ] Use state hook
  - [ ] Handle file upload (if applicable)
  - [ ] Implement mutation with callbacks
  - [ ] Show success state
- [ ] Create Edit[Entity].tsx
  - [ ] Use ResponsiveDialogDrawer
  - [ ] Use state hook
  - [ ] Fetch entity data
  - [ ] Handle file upload (if applicable)
  - [ ] Implement mutation with callbacks
  - [ ] Handle loading/error states
- [ ] Create Blocks folder for form sections
  - [ ] One component per section
  - [ ] Use ResponsiveDialogDrawerSection

### 7. Integration
- [ ] Add entity to navigation (if applicable)
- [ ] Add entity to search/filters (if applicable)
- [ ] Test create flow
- [ ] Test edit flow
- [ ] Test delete flow (if applicable)
- [ ] Test permission boundaries
- [ ] Test mobile responsiveness

---

## Common Patterns & Best Practices

### File Upload Handling

```typescript
async function handleCreateWithFile(state: TState) {
  let fileUrl = state.entity.fileUrl;

  if (state.fileHolder.file) {
    const fileName = `prefix_${state.entity.nome.toLowerCase().replaceAll(" ", "_")}`;
    const { url } = await uploadFile({ 
      file: state.fileHolder.file, 
      fileName: fileName, 
      vinculationId: vinculationId 
    });
    fileUrl = url;
  }

  return await createEntity({
    info: {
      ...state.entity,
      fileUrl: fileUrl,
    },
  });
}
```

### Handling Success with Reset

```typescript
{mutationData ? (
  <div className="flex w-full grow flex-col items-center justify-center gap-2">
    <div className="flex flex-col items-center gap-1">
      <BadgeCheck className="h-10 w-10 text-green-500 lg:h-20 lg:w-20" />
      <h1 className="text-center font-bold text-lg text-primary">
        Operação concluída com sucesso!
      </h1>
    </div>
    <Button
      onClick={() => {
        resetState();
        resetMutation();
      }}
      variant="secondary"
    >
      CRIAR NOVO
    </Button>
  </div>
) : (
  // Normal form content
)}
```

### Query Invalidation with Callbacks

```typescript
// In parent component
const handleModalCallbacks = {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["entities"] });
  },
  onSettled: () => {
    closeModal();
  },
};

<NewEntityModal 
  closeModal={closeModal}
  callbacks={handleModalCallbacks}
/>
```

### Conditional Field Rendering

```typescript
// In Block component
<ResponsiveDialogDrawerSection
  sectionTitleText="Configurações Avançadas"
  sectionTitleIcon={<Settings />}
>
  {infoHolder.categoria === "ESPECIAL" && (
    <Input
      label="Configuração Especial"
      value={infoHolder.configEspecial}
      onChange={(e) => updateInfoHolder({ configEspecial: e.target.value })}
    />
  )}
</ResponsiveDialogDrawerSection>
```

---

## Troubleshooting

### Type Inference Issues

**Problem**: Types not being inferred correctly from API routes

**Solution**: Ensure you're using `UnwrapNextResponse` and `Awaited<ReturnType<...>>`:

```typescript
// ✅ Correct
export type TGetEntityOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getEntity>>>;

// ❌ Incorrect
export type TGetEntityOutput = ReturnType<typeof getEntity>;
```

### Query String Arrays Not Parsing

**Problem**: Array parameters come as strings instead of arrays

**Solution**: Use Zod transform in input schema:

```typescript
filters: z
  .string()
  .nullable()
  .default(null)
  .transform((val) => (val ? val.split(",") : null)),
```

### State Not Updating in Modal

**Problem**: Form fields don't reflect state changes

**Solution**: Ensure you're using the update functions from the state hook, not setting state directly:

```typescript
// ✅ Correct
updateEntity({ nome: "New Name" });

// ❌ Incorrect
setState({ ...state, entity: { ...state.entity, nome: "New Name" } });
```

### File Upload Not Working

**Problem**: Uploaded file URL not being saved

**Solution**: Make sure you're awaiting the upload and assigning the URL before mutation:

```typescript
// File must be uploaded BEFORE the mutation
if (state.fileHolder.file) {
  const { url } = await uploadFile({ ... });
  fileUrl = url;
}

// Then pass the URL to the mutation
return await createEntity({
  info: { ...state.entity, fileUrl },
});
```

---

## Summary

This guide establishes patterns for:

1. **Consistent UI**: ResponsiveDialogDrawer for all modals
2. **Type-safe APIs**: End-to-end type inference from backend to frontend
3. **Clean State Management**: Reusable hooks with granular updates
4. **Predictable Data Fetching**: Standardized query hooks with built-in filters
5. **Maintainable Code**: Clear patterns that scale across entities

By following these patterns, new features can be implemented quickly while maintaining consistency across the application.

---

**Last Updated**: November 2025  
**Maintained By**: Lucas  
**For Questions**: Refer to existing implementations (Client, Kit, Lead, Goal)

