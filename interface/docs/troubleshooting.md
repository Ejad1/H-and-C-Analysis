# Dépannage & FAQ technique

Problèmes fréquents et comment les résoudre rapidement.

1) Le dev server ne démarre pas
- Vérifier Node.js version (>=18). `node -v`
- Supprimer `node_modules` et réinstaller :
  ```powershell
  rm -r node_modules
  npm ci
  ```

2) Erreur de compilation Vite (duplicate symbol)
- Vérifier les fichiers d'entrée (`src/main.jsx`, `src/App.jsx`) pour duplications d'exports/imports. Seuls `main.jsx` doit monter l'app.

3) Les clics sur les boutons ne déclenchent rien
- Ouvrir DevTools → Console : chercher exceptions JS qui empêchent l'exécution.
- Vérifier `pointer-events` CSS ou overlay modale qui peut capturer les clics.

4) Le micro ne fonctionne pas
- Vérifier permissions navigateur. Tester sur Chrome/Edge.
- MediaRecorder peut produire des blobs `webm` non supportés sur certains navigateurs.

5) Les conversations ne s'affichent pas après reload
- Vérifier la clé `elia_convos_<email>` dans localStorage et la structure JSON.
- Si la clé est corrompue, la supprimer et recréer avec une nouvelle conversation.

6) Déploiement Amplify échoue
- Vérifier logs du build dans Amplify Console (onglet Build logs).
- S'assurer que `interface/.amplify.yml` est accessible et que `package.json` contient les scripts attendus.

7) SSL/DNS pour domaine personnalisé
- Si validation ACM échoue : vérifier que les enregistrements TXT/CNAME demandés par Amplify ont bien été ajoutés.

8) Comment ajouter une vraie auth
- Remplacer stubs dans `AuthPage.jsx` par fetch/axios vers `/auth/login` et `/auth/register`.
- Gérer erreurs 401/403 et rafraîchissement de token (si token expiré).

Si tu as une erreur précise, copie‑colle l'erreur de la console et je te guide pour réparer.
