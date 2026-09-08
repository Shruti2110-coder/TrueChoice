# Deploying TrueChoice

Backend and frontend both deploy to [Render](https://render.com) from `render.yaml`.

---

## 0. Before you deploy: rotate the leaked credentials

`backend/.env` was committed in `d30e6a9` and pushed to a **public** repo, so the
Atlas password and the old `JWT_SECRET` are readable by anyone. They must be
replaced before this goes live.

1. **Atlas password** - Atlas -> Database Access -> your user -> Edit -> Edit Password.
2. **`JWT_SECRET`** - no action needed: `render.yaml` has Render generate a fresh one.
   Rotating it signs out every existing session, which is what you want here.
3. Update your local `backend/.env` with the new Atlas password.

Rotating makes the leaked values useless. It does not remove them from the repo
history - that needs a history rewrite and a force-push, which is a separate call.

## 1. Let Atlas accept connections from Render

Render's free tier has no fixed outbound IP, so pinning one address will not work.

Atlas -> Network Access -> Add IP Address -> **Allow access from anywhere**
(`0.0.0.0/0`).

This is safe only because your database password is the thing protecting you -
which is exactly why step 0 comes first.

## 2. Deploy the blueprint

1. Push this branch to GitHub.
2. Render Dashboard -> **New** -> **Blueprint** -> select `TrueChoice`.
3. Render reads `render.yaml` and proposes two services:
   - `truechoice-api` - the Express server
   - `truechoice-web` - the built React site
4. It will prompt for the values marked `sync: false`:
   - `MONGODB_URL` - your Atlas connection string, **with the new password**
   - `CORS_ORIGIN` - leave blank for now, you will fill it in at step 3
5. Apply. The API deploys first; the site builds against it.

## 3. Close the CORS loop

Once the static site is live you will have its URL, something like
`https://truechoice-web.onrender.com`.

Render -> `truechoice-api` -> Environment -> set `CORS_ORIGIN` to that URL -> Save.

The service restarts automatically. Until this is set, the browser will block
every API call from the deployed frontend.

## 4. Create the first admin

Signup deliberately cannot create admins - `roles` is forced to `voter`, so the
first admin has to be promoted directly in the database.

Sign up through the UI, then in Atlas -> Browse Collections -> `users`, find
your record and change `roles` from `voter` to `admin`. That account can then
add candidates:

```bash
curl -X POST https://truechoice-api.onrender.com/candidate \
  -H "Authorization: Bearer <your token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha Rao","party":"Green Front","age":45}'
```

Get the token from the login response, or from `localStorage.token` in devtools.

---

## Notes

- **Cold starts.** Free Render services sleep after ~15 minutes idle. The first
  request then takes 30-60s while the API wakes. The frontend shows its loading
  skeleton throughout, so it looks slow rather than broken.
- **`CORS_ORIGIN` accepts a bare host or a full URL** - both
  `truechoice-web.onrender.com` and `https://truechoice-web.onrender.com` work.
- **Client routing** is handled by the rewrite rule in `render.yaml`; every path
  serves `index.html`, so deep links and refreshes work.
- **Running locally** - copy `backend/.env.example` to `backend/.env` and
  `frontend/.env.example` to `frontend/.env`, then `npm start` (backend) and
  `npm run dev` (frontend).
