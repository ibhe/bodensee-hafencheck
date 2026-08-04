# Bodensee Hafencheck

Installierbare Offline-Web-App zur Prüfung der Hafenzugänglichkeit anhand:

- Pegel Konstanz
- Bootstiefgang
- Sicherheitspuffer
- Hafenplantiefe

## GitHub Pages aktivieren

1. Repository öffnen.
2. **Settings** → **Pages**.
3. Unter **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
4. **Save**.

Die App ist danach erreichbar unter:

`https://ibhe.github.io/bodensee-hafencheck/`

## Installation auf Android

Adresse in Chrome öffnen → Menü → **App installieren** oder **Zum Startbildschirm hinzufügen**.

## Berechnung

`aktuelle Tiefe = verwendete Hafenplantiefe + Pegel Konstanz - 2,50 m`

Quelle der Hafendaten: vom Nutzer bereitgestellte Ausgabe aus IBN Felizitas.


## Datenstand

Hafendaten zuletzt aus der Excel-Pflegedatei aktualisiert. Aktuell enthalten: **44 Häfen**.
