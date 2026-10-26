# BudgetVest on Netlify
1. Put this folder in a Git repo and import it in Netlify (publish dir `public`, functions `netlify/functions` come from netlify.toml). Drag-and-drop uploads skip functions, so use Git or the Netlify CLI (`netlify deploy --prod`).
2. Add the four variables from .env.example in Netlify, then redeploy.
3. Resend: verify your sending domain. Google: create an OAuth Web client and add your site URL as an authorized JavaScript origin.
4. Local testing: `npm i -g netlify-cli && netlify dev`.
