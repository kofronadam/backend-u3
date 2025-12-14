# Algorithm: GET /lists - Získání seznamu všech nákupních seznamů

## Popis

Tento koncový bod (uuCmd) vrací seznam všech nákupních seznamů uložených v databázi. Podporuje volitelné filtrování podle vlastníka.

## Vstupní parametry

- **owner** (query parameter, volitelný): Název vlastníka pro filtrování seznamů

## Výstup

- **HTTP 200**: JSON pole obsahující všechny nákupní seznamy (nebo filtrované podle vlastníka)
- **HTTP 500**: Chyba serveru při komunikaci s databází

## Algoritmus

```
ZAČÁTEK
  1. PŘIJMI HTTP GET požadavek na /lists

  2. EXTRAHUJ query parametr "owner" z požadavku

  3. POKUD owner je definován POTOM
       filter = { owner: owner }
     JINAK
       filter = {} (prázdný objekt - žádný filtr)
     KONEC POKUD

  4. POKUS
       a. ZAVOLEJ ShoppingList.find(filter) na MongoDB
       b. VYNECH pole _id, __v a items._id z výsledku
       c. NAČTI všechny odpovídající seznamy do proměnné lists

  5. POKUD CHYBA nastala během dotazu POTOM
       a. ZALOGUJ chybu
       b. VRAŤ HTTP 500 s JSON:
          {
            "error": {
              "code": "internal_error",
              "message": <popis chyby>
            }
          }
       c. UKONČI
     KONEC POKUD

  6. VRAŤ HTTP 200 s JSON polem lists

KONEC
```

## Příklad volání

### Požadavek

```http
GET /lists HTTP/1.1
Host: localhost:4000
```

### Odpověď (úspěch)

```json
[
  {
    "id": "abc123",
    "name": "Groceries",
    "owner": "John Doe",
    "items": [],
    "createdAt": "2025-12-13T10:00:00.000Z",
    "updatedAt": "2025-12-13T10:00:00.000Z"
  },
  {
    "id": "def456",
    "name": "Hardware Store",
    "owner": "Jane Smith",
    "items": [],
    "createdAt": "2025-12-13T11:00:00.000Z",
    "updatedAt": "2025-12-13T11:00:00.000Z"
  }
]
```

### Požadavek s filtrem

```http
GET /lists?owner=John%20Doe HTTP/1.1
Host: localhost:4000
```

### Odpověď (úspěch s filtrem)

```json
[
  {
    "id": "abc123",
    "name": "Groceries",
    "owner": "John Doe",
    "items": [],
    "createdAt": "2025-12-13T10:00:00.000Z",
    "updatedAt": "2025-12-13T10:00:00.000Z"
  }
]
```
