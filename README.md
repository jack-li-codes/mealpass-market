# MealPass Market

MealPass Market is a one-week school group project MVP for a student meal card balance exchange system.

The prototype allows students to:

- View active mock meal card balance listings.
- Create a new mock listing.
- Open a listing detail view.
- Request a listing and move it to Recent Requests.
- Track a mock buyer wallet balance.

This is a classroom MVP only. It does not include real money, real accounts, payment processing, or school system integration.

## How to Run Locally

Clone and run the project using terminal:
(Both create a folder named Projects. If this conflicts with anything on your computer, feel free to change it to something else)

Windows
cd C:\
mkdir Projects
cd Projects
git clone https://github.com/jack-li-codes/mealpass-market
cd mealpass-market
npm install
npm run dev -- -p 3000

Mac
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/jack-li-codes/mealpass-market
cd mealpass-market
npm install
npm run dev -- -p 3000

Open:

http://localhost:3000

Press Ctrl + C to stop the server.

## Main Project File

```text
app/page.tsx
```

This file contains the single-page MealPass Market MVP.
