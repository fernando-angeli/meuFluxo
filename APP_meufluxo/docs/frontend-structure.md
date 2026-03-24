# Frontend Structure

## Objective
This document explains the expected structure and behavior of the MeuFluxo frontend application.

## Frontend goals
- Provide a clean and modern financial SaaS experience
- Keep screens consistent and reusable
- Consume backend APIs without breaking established contracts
- Support incremental evolution with minimal rework

## Expected architecture
Adapt the content below to the real structure of the project.

Suggested areas:
- pages or app routes
- reusable UI components
- layout components
- form components
- table/list components
- services or api layer
- hooks
- types/interfaces
- utilities
- feature-based modules when appropriate

## Expected reusable elements
The frontend should prefer reusable building blocks such as:
- app shell
- sidebar
- topbar
- page header
- reusable table/list component
- modal form wrapper
- confirm dialog
- loading state
- empty state
- error state
- pagination controls
- sortable column headers

## CRUD pattern
For simple management screens:
- page with title and primary action
- search/filter when needed
- reusable list/table
- row actions like edit/delete
- create/edit via modal when appropriate
- confirmation before delete
- feedback after successful actions

## API consumption
- frontend must respect real backend contracts
- pagination and sorting must match backend expectations
- mapping of response data must be explicit and predictable
- avoid hardcoded assumptions about API payloads

## Categories and subcategories
- categories and subcategories should remain visually connected
- prefer hierarchical or contextual visualization
- avoid fragmented navigation when a unified experience is clearer

### Reusable hierarchical / parent-child pattern (MeuFluxo)
Use these building blocks for future screens (cost centers, groups/items, etc.):

| Piece | Location | Role |
|-------|----------|------|
| `ExpandableDataTable` | `@/components/data-table/ExpandableDataTable` | Same as `DataTable` but requires `expandedRowKey` + `renderExpandedRow` (semantic clarity). |
| `RowActionButtons` | `@/components/patterns` | Icon buttons for edit/delete/expand; use in column `cell` renderers. |
| `FormDialogShell` + `FormModalAlert` | `@/components/patterns` | Modal header + optional `generalError` above the form body (category, subcategory, account modals). |
| `HierarchicalChildPanel` | `@/components/patterns` | Indented panel under an expanded row; stops click propagation. |
| `PanelSectionHeader` | `@/components/patterns` | Title + subtitle + optional action (e.g. “Nova subcategoria”). |
| `SectionLoadingState` / `SectionEmptyState` / `SectionErrorState` | `@/components/patterns` | Inline loading/empty/error inside a section or expanded panel. |
| `getQueryErrorMessage` | `@/lib/query-error` | Normalize `useQuery` errors for table or panel error text. |

**Reference implementation:** `features/categories` (page + `CategorySubcategoriesPanel` + row actions + form modals). **Accounts** use the same modal shell and query error helper for consistency.

## Expected quality bar
- readable code
- low duplication
- consistent naming
- minimal side effects
- focused components
- maintainable evolution