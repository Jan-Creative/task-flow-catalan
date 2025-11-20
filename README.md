# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/29c21e47-6d11-416e-8e58-0a6c1c7c894b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/29c21e47-6d11-416e-8e58-0a6c1c7c894b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/29c21e47-6d11-416e-8e58-0a6c1c7c894b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Mode Stable (Production)

Per executar l'aplicació en mode stable amb màxima estabilitat:

### Com activar-lo
Afegeix el paràmetre `?stable=1` a la URL:
```
https://yourdomain.com/?stable=1
```

### Què fa el mode stable?
- ✅ **Desactiva debugging i monitors**: PerformanceMonitor, MemoryLeakMonitor desactivats
- ✅ **Només providers essencials**: Background, KeyboardShortcuts, UnifiedTask, Notification
- ✅ **Cache ultra-conservador**: `staleTime: 5min`, `refetchOnWindowFocus: false`
- ✅ **Zero logs no essencials**: Només errors crítics al console
- ✅ **Limitat a Phase 1-3**: Providers de Phase 4 (platform-specific) desactivats

### Providers actius en mode stable
1. **Background** (Phase 1) - Gestió de fons visual
2. **KeyboardShortcuts** (Phase 1) - Dreceres de teclat
3. **UnifiedTask** (Phase 3) - Gestió de tasques
4. **Notification** (Phase 3) - Notificacions

### Providers desactivats en mode stable
- Security (no essencial per funcionament bàsic)
- PropertyDialog (UI no crítica)
- Offline (funcionalitat opcional)
- Pomodoro (widget opcional)
- KeyboardNavigation, MacNavigation, IPadNavigation (platform-specific)

### Quan usar mode stable?
- **Production builds** - Per usuaris finals
- **Preview environment** - Quan hi ha problemes de rendiment
- **Debugging complex** - Per aïllar problemes de providers
- **Dispositius lents** - Per millorar rendiment

### Desactivar mode stable
Simplement elimina el paràmetre de la URL o recarrega sense `?stable=1`
