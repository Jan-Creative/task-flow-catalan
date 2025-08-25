# Guia de Seguretat de l'Aplicació

## 🔒 Resum de Seguretat Implementada

L'aplicació ha estat configurada amb un sistema de seguretat robust que inclou múltiples capes de protecció.

### ✅ Problemes de Seguretat Resolts

1. **Function Search Path Mutable** - ✅ SOLUCIONAT
   - Totes les funcions de la base de dades ara tenen `SET search_path TO 'public'`
   - Prevé injeccions SQL mitjançant manipulació del search path

2. **User Profile Information Exposed** - ✅ SOLUCIONAT 
   - Polítiques RLS més restrictives per la taula profiles
   - Els usuaris només poden veure el seu propi perfil complet
   - Accés limitat a informació bàsica d'altres usuaris

### ⚠️ Configuracions Pendents (Requereixen Acció Manual)

**IMPORTANT**: Aquests ajustos s'han de fer manualment a la consola de Supabase:

1. **Auth OTP Long Expiry** - ⚠️ ACCIÓ REQUERIDA
   - Anar a: Supabase Dashboard > Authentication > Settings
   - Configurar OTP expiry a 5-10 minuts (recomanat: 5 minuts)
   - Actualment està configurat amb un temps massa llarg

2. **Leaked Password Protection Disabled** - ⚠️ ACCIÓ REQUERIDA  
   - Anar a: Supabase Dashboard > Authentication > Settings
   - Activar "Leaked Password Protection"
   - Això impedeix l'ús de contrasenyes compromeses conegudes

## 🛡️ Funcionalitats de Seguretat Implementades

### 1. **Autenticació i Autorització**
- ✅ Autenticació segura amb Supabase Auth
- ✅ Row Level Security (RLS) en totes les taules
- ✅ Polítiques d'accés restrictives basades en usuari
- ✅ Tokens d'autenticació amb renovació automàtica

### 2. **Validació d'Entrada**
- ✅ Validació de tipus per emails, contrasenyes, URLs i text
- ✅ Sanitització HTML per prevenir XSS
- ✅ Validació de longitud i format de dades
- ✅ Prevenció d'injeccions de codi

### 3. **Rate Limiting**
- ✅ Limitació de sol·licituds per usuari
- ✅ Protecció contra atacs de força bruta
- ✅ Monitoring d'activitat sospitosa
- ✅ Logs de seguretat automàtics

### 4. **Headers de Seguretat** 
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options, X-XSS-Protection
- ✅ Strict-Transport-Security
- ✅ Cross-Origin Protection

### 5. **Monitoring i Auditoria**
- ✅ Logging d'esdeveniments de seguretat
- ✅ Monitor de performance en desenvolupament
- ✅ Monitor de seguretat (Ctrl+Shift+S)
- ✅ Detecció d'activitat anòmala

## 🔧 Configuració de Seguretat

### Variables d'Entorn Segures
```typescript
// Configuració automàtica segons l'entorn
const securityConfig = {
  enableRateLimit: production,
  enableSecurityHeaders: production,
  maxLoginAttempts: 5,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24h
  allowedOrigins: [...] // Configuració automàtica
}
```

### Content Security Policy
```typescript
const cspPolicies = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://supabase.co",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://supabase.co wss://supabase.co",
  "object-src 'none'",
  "base-uri 'self'"
];
```

## 🚨 Accions Requerides

### 1. Configuració Manual de Supabase (URGENT)

Vés a la [consola de Supabase](https://supabase.com/dashboard/project/umfrvkakvgsypqcyyzke) i configura:

**Authentication > Settings:**
- ✅ OTP Expiry: Canviar a 5 minuts
- ✅ Leaked Password Protection: Activar

### 2. URL Configuration
**Authentication > URL Configuration:**
- Site URL: `https://your-domain.com` (o URL de producció)
- Redirect URLs: Afegir totes les URLs vàlides

### 3. Configuració de Producció
Quan es desplegui a producció:
- ✅ Verificar que HTTPS estigui activat
- ✅ Configurar domini personalitzat
- ✅ Revisar logs de seguretat regularment

## 🔍 Monitoring en Desenvolupament

### Performance Monitor (Ctrl+Shift+P)
- Métriques de renderització
- Ús de memòria
- Nombre de queries
- Errors recents

### Security Monitor (Ctrl+Shift+S)  
- Estat de seguretat general
- Issues detectats
- Estat de rate limiting
- Configuració actual

## 📋 Checklist de Seguretat

### Pre-Producció
- [ ] Configurar OTP expiry a 5 minuts
- [ ] Activar Leaked Password Protection
- [ ] Configurar URLs correctes
- [ ] Verificar polítiques RLS
- [ ] Testejar autenticació
- [ ] Revisar headers de seguretat

### Post-Producció  
- [ ] Monitoring de logs actiu
- [ ] Backups automàtics configurats
- [ ] Alertes de seguretat configurades
- [ ] Revisió regular de polítiques
- [ ] Auditoria de permisos d'usuari

## 🆘 Resposta a Incidents

### Detecció d'Activitat Sospitosa
1. **Rate Limiting Activat**: Usuari bloquejat temporalment
2. **Intents de Login Fallits**: Logs automàtics + alertes
3. **Inputs Maliciosos**: Validació rebutja automàticament
4. **Accés No Autoritzat**: RLS bloqueja automàticament

### Contacte de Seguretat
En cas d'incident greu:
- Revisar logs de seguretat
- Contactar amb l'administrador del sistema
- Documentar l'incident
- Implementar mesures correctives

---

**Última actualització**: Agost 2025  
**Versió**: 1.0.0  
**Status**: ✅ Seguretat implementada - Configuració manual pendent