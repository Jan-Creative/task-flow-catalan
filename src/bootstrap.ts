console.log('🟨 BOOTSTRAP started');

// Visual indicator that bootstrap is alive
(function () {
  const tag = document.createElement('div');
  tag.textContent = '🟨 BOOTSTRAP alive';
  tag.style.cssText = 'position:fixed;bottom:40px;right:8px;background:#fff;color:#111;border:1px solid #111;padding:6px 10px;font:12px/1 system-ui;z-index:2147483647;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.3)';
  
  if (document.body) {
    document.body.appendChild(tag);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(tag));
  }
  
  (window as any).__removeBootstrapTag = () => tag.remove();
})();

// Helper timeout wrapper
function withTimeout<T>(p: Promise<T>, ms: number, label = 'import timeout'): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    p.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
  });
}

async function start() {
  try {
    console.log('🟨 BOOTSTRAP: Attempting to load main.tsx...');
    
    // Dynamic import - Vite will transform this to the actual bundle in production
    await withTimeout(import('./main.tsx'), 8000, 'main.tsx import timeout');
    
    console.log('🟩 BOOTSTRAP -> main.tsx loaded successfully');
    (window as any).__removeBootstrapTag?.();
  } catch (e) {
    console.error('🟥 BOOTSTRAP error loading main.tsx', e);
    
    // Fallback UI so user doesn't see a black screen
    const root = document.getElementById('root') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'root' }));
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#ffffff;color:#111;font-family:system-ui,-apple-system,sans-serif;padding:24px;">
        <div style="max-width:560px;text-align:center">
          <div style="font-size:40px;margin-bottom:8px">⚠️</div>
          <h1 style="font-size:22px;font-weight:800;margin:0 0 8px">No s'ha pogut carregar l'aplicació</h1>
          <p style="opacity:.8;margin:0 0 16px">El bundle principal no s'ha avaluat. Prova aquestes opcions de diagnòstic:</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
            <button onclick="location.reload()" style="padding:10px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer">🔄 Recarregar</button>
            <button onclick="location.href='/?single=1&bootdebug=1'" style="padding:10px 16px;background:#6b7280;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer">1️⃣ Single render</button>
            <button onclick="location.href='/?ultra=1'" style="padding:10px 16px;background:#065f46;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer">⚡ Ultra mode</button>
            <button onclick="location.href='/?preonly=1'" style="padding:10px 16px;background:#9ca3af;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer">🧪 Preonly</button>
          </div>
          <pre style="text-align:left;background:#f5f5f5;padding:12px;border-radius:6px;margin-top:16px;max-height:180px;overflow:auto;font:12px/1.4 ui-monospace,monospace">${(e as Error)?.stack || String(e)}</pre>
        </div>
      </div>
    `;
  }
}

start();
