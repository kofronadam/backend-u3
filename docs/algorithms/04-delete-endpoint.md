# Algorithm: DELETE /lists/:id - Smazání nákupního seznamu

## Popis

Tento koncový bod (uuCmd) smaže celý nákupní seznam včetně všech jeho položek z databáze.

## Vstupní parametry

- **id** (URL parametr, povinný): Jedinečný identifikátor nákupního seznamu k smazání

## Výstup

- **HTTP 204**: Seznam byl úspěšně smazán (žádný response body)
- **HTTP 404**: Seznam s daným ID nebyl nalezen
- **HTTP 500**: Chyba serveru při mazání z databáze

## Algoritmus

```
ZAČÁTEK
  1. PŘIJMI HTTP DELETE požadavek na /lists/:id

  2. EXTRAHUJ parametr "id" z URL cesty (req.params.id)

  3. POKUS
       a. ZAVOLAJ ShoppingList.deleteOne({ id: id }) na MongoDB
       b. ULOŽ výsledek operace do proměnné result
       c. Z result EXTRAHUJ počet smazaných záznamů (result.deletedCount)

  4. POKUD CHYBA nastala během mazání POTOM
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

  5. POKUD result.deletedCount === 0 POTOM
       a. VRAŤ HTTP 404 s JSON:
          {
            "error": {
              "code": "not_found",
              "message": "List not found"
            }
          }
       b. UKONČI
     KONEC POKUD

  6. VRAŤ HTTP 204 (No Content) bez response body

KONEC
```

## Příklad volání

### Požadavek

```http
DELETE /lists/abc123 HTTP/1.1
Host: localhost:4000
```

### Odpověď (úspěch)

```http
HTTP/1.1 204 No Content
```

### Odpověď (nenalezeno)

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": {
    "code": "not_found",
    "message": "List not found"
  }
}
```

## Použití

Tento endpoint se používá pro:

- Trvalé odstranění nákupního seznamu
- Vyčištění starých nebo nepoužívaných seznamů
- Administrativní operace

## Důležité poznámky

- **POZOR**: Operace je nevratná! Všechna data seznamu včetně položek jsou trvale smazána
- deleteOne() smaže pouze jeden dokument, i když by teoreticky odpovídalo více (díky unique indexu na id)
- Operace je atomická - buď se smaže celý seznam, nebo nic
- Žádný partial delete není možný

## Workflow doporučení

Před smazáním seznamu je doporučeno:

1. Zobrazit uživateli potvrzovací dialog
2. Případně načíst detail seznamu (GET /lists/:id) pro zobrazení obsahu
3. Implementovat "soft delete" (označení jako smazaný) místo hard delete v produkci
4. Udržovat audit log smazaných záznamů
