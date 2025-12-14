# Algorithm: PATCH /lists/:id - Aktualizace nákupního seznamu

## Popis

Tento koncový bod (uuCmd) umožňuje částečnou aktualizaci existujícího nákupního seznamu. Lze měnit název seznamu a/nebo vlastníka.

## Vstupní parametry

- **id** (URL parametr, povinný): Jedinečný identifikátor nákupního seznamu
- **name** (body, volitelný): Nový název seznamu (pokud je zadán, musí být neprázdný string)
- **owner** (body, volitelný): Nový vlastník seznamu (string nebo null)

## Výstup

- **HTTP 200**: JSON objekt s aktualizovaným seznamem
- **HTTP 400**: Validační chyba (prázdný název)
- **HTTP 404**: Seznam s daným ID nebyl nalezen
- **HTTP 500**: Chyba serveru při ukládání do databáze

## Algoritmus

```
ZAČÁTEK
  1. PŘIJMI HTTP PATCH požadavek na /lists/:id

  2. EXTRAHUJ parametr "id" z URL cesty (req.params.id)

  3. EXTRAHUJ name a owner z těla požadavku (req.body)

  4. POKUS
       a. ZAVOLAJ ShoppingList.findOne({ id: id }) na MongoDB
       b. ULOŽ výsledek do proměnné list

  5. POKUD CHYBA nastala během načítání POTOM
       a. ZALOGUJ chybu
       b. VRAŤ HTTP 500 s JSON chybou
       c. UKONČI
     KONEC POKUD

  6. POKUD list je null nebo undefined POTOM
       a. VRAŤ HTTP 404 s JSON:
          {
            "error": {
              "code": "not_found",
              "message": "List not found"
            }
          }
       b. UKONČI
     KONEC POKUD

  7. AKTUALIZACE POLÍ (pouze pokud jsou definovány):

     POKUD name !== undefined POTOM
       a. VALIDACE: POKUD name NENÍ neprázdný string POTOM
            VRAŤ HTTP 400 s JSON:
            {
              "error": {
                "code": "validation_failed",
                "message": "name must be a non-empty string"
              }
            }
            UKONČI
          KONEC POKUD
       b. list.name = trim(name)
     KONEC POKUD

     POKUD owner !== undefined POTOM
       a. POKUD owner je neprázdný string POTOM
            list.owner = trim(owner)
          JINAK
            list.owner = null
          KONEC POKUD
     KONEC POKUD

  8. POKUS
       a. ZAVOLAJ list.save() pro uložení změn do MongoDB
       b. PŘEVEĎ výsledek na plain objekt pomocí toObject()
       c. ODSTRAŇ pole _id a __v z výsledku
       d. ULOŽ do proměnné response

  9. POKUD CHYBA nastala během ukládání POTOM
       a. ZALOGUJ chybu
       b. VRAŤ HTTP 500 s JSON chybou
       c. UKONČI
     KONEC POKUD

  10. VRAŤ HTTP 200 s JSON objektem response

KONEC
```

## Příklad volání

### Požadavek - aktualizace názvu

```http
PATCH /lists/abc123 HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "name": "Weekly Groceries"
}
```

### Odpověď (úspěch)

```json
{
  "id": "abc123",
  "name": "Weekly Groceries",
  "owner": "John Doe",
  "items": [
    {
      "id": "item1",
      "name": "Milk",
      "quantity": 2,
      "checked": false
    }
  ],
  "createdAt": "2025-12-13T10:00:00.000Z",
  "updatedAt": "2025-12-13T15:30:00.000Z"
}
```

### Požadavek - aktualizace vlastníka na null

```http
PATCH /lists/abc123 HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "owner": null
}
```

### Požadavek - aktualizace obou polí

```http
PATCH /lists/abc123 HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "name": "Monthly Shopping",
  "owner": "Jane Smith"
}
```

### Odpověď (validační chyba)

```json
{
  "error": {
    "code": "validation_failed",
    "message": "name must be a non-empty string"
  }
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

- Změnu názvu existujícího seznamu
- Přiřazení/odebrání vlastníka seznamu
- Korekci chyb v metadatech seznamu
- Přenos vlastnictví seznamu na jiného uživatele

## Důležité poznámky

- **Částečná aktualizace**: Pouze zadaná pole jsou aktualizována
- Pole items není možné aktualizovat tímto endpointem (použij endpoint pro položky)
- Timestamp updatedAt je automaticky aktualizován MongoDB
- Timestamp createdAt zůstává nezměněn
- Whitespace je odstraněn pomocí trim()
