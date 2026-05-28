# Intune Monitor Dashboard

Echtzeit-Überwachung von Intune-verwalteten Geräten via Graph API.

## Deployment auf Netlify

### Schritt 1 – Repository vorbereiten

Alle Dateien in dein GitHub Repository hochladen:
```
intune-monitor/
  IntuneDashboard.html
  netlify.toml
  api/
    graph.js
  README.md
```

### Schritt 2 – Netlify verbinden

1. netlify.com öffnen und einloggen
2. "Add new site" → "Import an existing project"
3. GitHub verbinden und das Repository auswählen
4. Build settings werden automatisch aus netlify.toml gelesen
5. "Deploy site" klicken

### Schritt 3 – Environment Variables setzen

> **Netlify → Site → Site configuration → Environment variables → Add variable**

| Variable | Wert |
|---|---|
| `TENANT_ID` | Deine Entra Tenant ID |
| `CLIENT_ID` | App Registration Client ID |
| `CLIENT_SECRET` | App Registration Client Secret |

Nach dem Setzen: **Trigger deploy** → damit die Variables aktiv werden.

### Schritt 4 – Dashboard öffnen

Die Netlify URL öffnen:
```
https://[dein-site-name].netlify.app/IntuneDashboard.html
```

Proxy URL im Dashboard unten eingeben:
```
https://[dein-site-name].netlify.app/api/graph
```

"Testen" klicken → "Aktualisieren" klicken.

## Sicherheitshinweise

- Credentials werden NUR als Netlify Environment Variables gespeichert
- Kein Secret im Code oder im Repository
- HTTPS verschlüsselt
- Repository kann private bleiben (Netlify unterstützt private Repos kostenlos)

## App Registration Berechtigungen

Benötigt in Entra ID (Anwendungsberechtigungen):
- `User.Read.All`
- `GroupMember.Read.All`
- `Device.Read.All`
- `DeviceManagementManagedDevices.Read.All`
- `DeviceManagementConfiguration.Read.All`
- `DeviceManagementApps.Read.All`
- `DeviceManagementRBAC.Read.All`
- `Organization.Read.All`

Nach dem Hinzufügen: **Administratorzustimmung erteilen** klicken.
