# TrueChoice

A secure online voting app: one person, one vote, with live results.

**Live demo:** https://true-choice-ecru.vercel.app

## What it does

- **Voters** sign up with their Aadhaar number, log in, see the candidates, and cast one vote. After voting, they can't vote again.
- **Admins** add, edit and remove candidates. Admins can't vote, and nobody can make themselves an admin at sign-up.
- **Live results** show every candidate's vote count, sorted from highest to lowest. Anyone can see them without logging in.

> This is a learning project. Please don't enter a real Aadhaar number on the demo.

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express, MongoDB with Mongoose |
| Auth | JWT, bcrypt password hashing, voter and admin roles |
| Hosting | Render (see `render.yaml` and `DEPLOY.md`) |

## Run it locally

You need Node.js and a MongoDB database.

**Backend**

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

`backend/.env`:

```
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017/truechoice
JWT_SECRET=replace-with-a-long-random-string
CORS_ORIGIN=http://localhost:5173
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:5173.

## API

| Method | Route | Who | What it does |
| --- | --- | --- | --- |
| POST | `/user/signup` | Anyone | Create a voter account |
| POST | `/user/login` | Anyone | Log in with Aadhaar number and password |
| GET | `/user/profile` | Logged in | Your profile |
| PUT | `/user/profile/password` | Logged in | Change password |
| GET | `/candidate` | Anyone | List candidates |
| GET | `/candidate/vote/count` | Anyone | Live vote counts |
| POST | `/candidate/vote/:candidateID` | Voter | Cast your vote |
| POST | `/candidate` | Admin | Add a candidate |
| PUT | `/candidate/:candidateID` | Admin | Edit a candidate |
| DELETE | `/candidate/:candidateID` | Admin | Remove a candidate |

## Deploying

Step-by-step instructions are in [DEPLOY.md](DEPLOY.md).

## Author

Built by [Shruti Jain](https://github.com/Shruti2110-coder).
