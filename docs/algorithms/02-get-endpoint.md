# Algorithm: GET /lists/:id - Získání jednoho nákupního seznamu

## Popis

Tento koncový bod (uuCmd) vrací detail jednoho konkrétního nákupního seznamu na základě jeho jedinečného ID.

## Vstupní parametry

- **id** (URL parametr, povinný): Jedinečný identifikátor nákupního seznamu

## Výstup

- **HTTP 200**: JSON objekt obsahující detail nákupního seznamu
- **HTTP 404**: Seznam s daným ID nebyl nalezen
- **HTTP 500**: Chyba serveru při komunikaci s databází

## Algoritmus

```
ZAČÁTEK
  1. PŘIJMI HTTP GET požadavek na /lists/:id

  2. EXTRAHUJ parametr "id" z URL cesty (req.params.id)

  3. POKUS
       a. ZAVOLAJ ShoppingList.findOne({ id: id }) na MongoDB
       b. VYNECH pole _id, __v a items._id z výsledku
       c. ULOŽ výsledek do proměnné list

  4. POKUD CHYBA nastala během dotazu POTOM
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

  5. POKUD list je null nebo undefined POTOM
       a. VRAŤ HTTP 404 s JSON:
          {
            "error": {
              "code": "not_found",
              "message": "List not found"
            }
          }
       b. UKONČI
     KONEC POKUD

  6. VRAŤ HTTP 200 s JSON objektem list

KONEC
```

## Příklad volání

### Požadavek

```http
GET /lists/abc123 HTTP/1.1
Host: localhost:4000
```

### Odpověď (úspěch)

```json
{
  "id": "abc123",
  "name": "Groceries",
  "owner": "John Doe",
  "items": [
    {
      "id": "item1",
      "name": "Milk",
      "quantity": 2,
      "checked": false
    },
    {
      "id": "item2",
      "name": "Bread",
      "quantity": 1,
      "checked": true
    }
  ],
  "createdAt": "2025-12-13T10:00:00.000Z",
  "updatedAt": "2025-12-13T12:30:00.000Z"
}
```

### Odpověď (nenalezeno)

```json
{
  "error": {
    "code": "not_found",
    "message": "List not found"
  }
}
```

## Použití

Tento endpoint se používá pro:

- Zobrazení detailu nákupního seznamu
- Načtení všech položek v seznamu
- Kontrola existence seznamu před úpravami
