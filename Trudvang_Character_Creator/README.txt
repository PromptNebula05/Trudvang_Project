Trudvang Chronicles Character Creator
========================================

This is a comprehensive, secure character creation application for Trudvang Chronicles, published by
RiotMinds Studios, that guides players through the character generation process while implementing
robust user management and role-based access control.

PROJECT OVERVIEW / FEATURES
---------------------------
  - 7-step character creation wizard (Origin -> Archetype -> Traits -> Skills -> Disciplines ->
    Equipment -> Review)
  - Creation point budget system (Beginner 300 / Practiced 500 / Experienced 700 CP)
  - Seven core traits (Charisma, Constitution, Dexterity, Intelligence, Perception, Psyche, Strength
    each -4 to +4)
  - Skills with nested Disciplines and Specialties
  - Character dashboard and saved character sheet viewer
  - Admin panel for managing game content (Origins, Archetypes, Skills, Equipment)

TECH STACK
----------
  - React + React Router + Apollo Client (frontend)
  - Node.js + Express (REST API on /api/*)
  - Apolo Server 4 + GraphQL (on /graphql)
  - MongoDB + Mongoose (data layer)
  - JWT + bcryptjs (auth)

REQUIREMENTS
  - Node.js 18+
  - MongoDB running locally (default: mongodb://localhost:27017/trudvang_db)

SETUP & RUN
-----------

1. Server (run first)
  cd Server
  npm install
  npm run seed    <- runs dbInit.js (game data) and dbInitUsers.js (default accounts)
  npm start       <- starts REST + GraphQL API on http://localhost:4000

2. React Client (in separate terminal)
  cd React
  npm install
  npm start       <- opens app at http://localhost:3000

ENVIRONMENT
-----------
Optionally create Server/.env to override defaults:
  MONGODB_URI=mongodb://localhost:27017/trudvang_db
  JWT_SECRET=your_secret_here
  JWT_EXPIRES_IN=8h
  PORT=4000

DEFAULT ACCOUNTS
----------------
admin          / AdminPass1!  (role: admin)
standarduser   / UserPass1!   (role: user)

REFERENCE
---------

Bergqvist, T., & Malmberg, M.(2021). Trudvang Chronicles Player's Handbook. RiotMinds.