# MealPass Market

MealPass Market is a one-week school group project MVP for a student meal card balance exchange system. The prototype lets students view mock meal card listings, create a mock listing, request a listing, and track recent pending meetup requests.

Classroom MVP only. No real money, accounts, payment processing, or school system integration is included.

## How To Run Locally

1. Open a terminal in the project folder:

   ```powershell
   cd "C:\Users\lucy_\OneDrive\文档\mealpass prototype"
   ```

2. Install dependencies if needed:

   ```powershell
   npm install
   ```

3. Start the development server:

   ```powershell
   npm run dev
   ```

4. Open the local URL shown in the terminal. Usually:

   ```text
   http://localhost:3000
   ```

   If `localhost` has connection issues, try:

   ```text
   http://127.0.0.1:3000
   ```

## MVP Features

- View active meal card balance listings.
- See seller name, meal card balance, asking price, discount, and meetup note.
- Create a new mock listing using React state.
- Open a transaction detail view for a listing.
- Confirm a request to remove it from active listings.
- Track confirmed requests in Recent Requests with `Pending meetup` status.
- Track a mock buyer wallet balance that decreases by the listing asking price.

## Team Workflow

- Pull the latest code before starting work.
- Create a separate branch for each task or feature.
- Keep changes small and focused.
- Do not commit generated folders such as `node_modules` or `.next`.
- Run these checks before opening or merging a pull request:

  ```powershell
  npm run lint
  npm run build
  ```

- Use clear commit messages, for example:

  ```text
  Add recent requests table
  ```

## Folder Structure

```text
app/
  globals.css       Global Tailwind styles
  layout.tsx        Next.js root layout
  page.tsx          Single-page MealPass Market MVP
docs/
  meeting-notes/    Team meeting notes
  project-management/ Planning, roles, timeline, and task tracking
  testing/          Test plans, bug reports, and QA notes
  screenshots/      Demo screenshots and UI evidence
```

## Meeting Notes Location

Meeting notes should be saved in:

```text
docs/meeting-notes/
```

The kickoff meeting note is:

```text
docs/meeting-notes/meeting-01-kickoff.md
```

## Testing Documents Location

Testing documents should be saved in:

```text
docs/testing/
```

Suggested testing files:

- `test-plan.md`
- `manual-test-results.md`
- `known-issues.md`
