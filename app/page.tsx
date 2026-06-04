"use client";

import { FormEvent, useState } from "react";

type Listing = {
  id: number;
  sellerName: string;
  balanceAmount: number;
  askingPrice: number;
  locationNote: string;
};

type View = "listings" | "create" | "detail";

const initialListings: Listing[] = [
  {
    id: 1,
    sellerName: "Maya R.",
    balanceAmount: 42,
    askingPrice: 34,
    locationNote: "North cafeteria, lunch block transfer"
  },
  {
    id: 2,
    sellerName: "Jordan K.",
    balanceAmount: 28,
    askingPrice: 22,
    locationNote: "Library commons after school"
  },
  {
    id: 3,
    sellerName: "Sam P.",
    balanceAmount: 65,
    askingPrice: 52,
    locationNote: "Student atrium, best for weekly lunches"
  }
];

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0
});

function getDiscount(balanceAmount: number, askingPrice: number) {
  if (balanceAmount <= 0 || askingPrice >= balanceAmount) {
    return 0;
  }

  return Math.round(((balanceAmount - askingPrice) / balanceAmount) * 100);
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [recentRequests, setRecentRequests] = useState<Listing[]>([]);
  const [walletBalance, setWalletBalance] = useState(100);
  const [view, setView] = useState<View>("listings");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    sellerName: "",
    balanceAmount: "",
    askingPrice: "",
    locationNote: ""
  });

  // New: filter state for searching by balanceAmount / askingPrice
  const [filters, setFilters] = useState({
    minBalance: "",
    maxAsking: ""
  });

  function openListing(listing: Listing) {
    setSuccessMessage("");
    setSelectedListing(listing);
    setView("detail");
  }

  function confirmRequest() {
    if (!selectedListing) {
      return;
    }

    setListings((currentListings) =>
      currentListings.filter((listing) => listing.id !== selectedListing.id)
    );
    setRecentRequests((currentRequests) => [
      selectedListing,
      ...currentRequests
    ]);
    setWalletBalance((currentBalance) =>
      currentBalance - selectedListing.askingPrice
    );
    setSuccessMessage(
      `Request confirmed for ${selectedListing.sellerName}'s listing.`
    );
    setSelectedListing(null);
    setView("listings");
  }

  function submitListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const balanceAmount = Number(form.balanceAmount);
    const askingPrice = Number(form.askingPrice);

    if (
      !form.sellerName.trim() ||
      !form.locationNote.trim() ||
      balanceAmount <= 0 ||
      askingPrice <= 0
    ) {
      return;
    }

    setListings((currentListings) => [
      {
        id: Date.now(),
        sellerName: form.sellerName.trim(),
        balanceAmount,
        askingPrice,
        locationNote: form.locationNote.trim()
      },
      ...currentListings
    ]);
    setForm({
      sellerName: "",
      balanceAmount: "",
      askingPrice: "",
      locationNote: ""
    });
    setSuccessMessage("Listing created and added to active listings.");
    setView("listings");
  }

  // Derived filtered listings based on search inputs
  const filteredListings = listings.filter((l) => {
    const minBal = Number(filters.minBalance);
    const maxAsk = Number(filters.maxAsking);

    if (filters.minBalance !== "" && !Number.isNaN(minBal)) {
      if (l.balanceAmount < minBal) return false;
    }

    if (filters.maxAsking !== "" && !Number.isNaN(maxAsk)) {
      if (l.askingPrice > maxAsk) return false;
    }

    return true;
  });

  function clearFilters() {
    setFilters({ minBalance: "", maxAsking: "" });
  }

  function applyAffordableFilter() {
    setFilters((f) => ({ ...f, maxAsking: String(walletBalance) }));
  }

  return (
    <main className="min-h-screen bg-[#f7faf5] text-market-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-4 border-b border-market-ink/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
              MealPass Market
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-market-ink/65">
              Classroom MVP only. No real money, accounts, or school system
              integration.
            </p>
          </div>
          <button
            onClick={() => {
              setSuccessMessage("");
              setSelectedListing(null);
              setView("create");
            }}
            className="inline-flex items-center justify-center rounded-md bg-market-leaf px-5 py-3 font-bold text-white transition hover:bg-[#286b47]"
          >
            Create Listing
          </button>
        </header>

        {successMessage ? (
          <div className="rounded-lg border border-market-leaf/20 bg-market-mint px-4 py-3 font-semibold text-market-leaf">
            {successMessage}
          </div>
        ) : null}

        {view === "listings" ? (
          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-market-ink/10 bg-white p-4">
                <p className="text-sm text-market-ink/60">Active listings</p>
                <p className="mt-1 text-2xl font-black">{listings.length}</p>
              </div>
              <div className="rounded-lg border border-market-ink/10 bg-white p-4">
                <p className="text-sm text-market-ink/60">My wallet balance</p>
                <p className="mt-1 text-2xl font-black">
                  {money.format(walletBalance)}
                </p>
              </div>
              <div className="rounded-lg border border-market-ink/10 bg-white p-4">
                <p className="text-sm text-market-ink/60">Request method</p>
                <p className="mt-1 text-2xl font-black">Manual</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Active Listings</h2>
              <p className="text-sm text-market-ink/60">Mock data only</p>
            </div>

            {/* New: Filters UI */}
            <div className="flex flex-col gap-3 rounded-lg border border-market-ink/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <span className="text-sm text-market-ink/70">Min balance</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.minBalance}
                    onChange={(e) =>
                      setFilters({ ...filters, minBalance: e.target.value })
                    }
                    placeholder="e.g. 30"
                    className="ml-2 w-28 rounded-md border border-market-ink/15 bg-white px-3 py-2 outline-none transition focus:border-market-leaf"
                  />
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-sm text-market-ink/70">Max asking</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxAsking}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAsking: e.target.value })
                    }
                    placeholder="e.g. 40"
                    className="ml-2 w-28 rounded-md border border-market-ink/15 bg-white px-3 py-2 outline-none transition focus:border-market-leaf"
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyAffordableFilter}
                  className="inline-flex items-center justify-center rounded-md bg-market-leaf px-3 py-2 font-bold text-white transition hover:bg-[#286b47]"
                >
                  Affordable for me
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center rounded-md border border-market-ink/15 bg-white px-3 py-2 font-bold text-market-ink transition hover:border-market-leaf/50 hover:text-market-leaf"
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* Show filtered count/help */}
            <div className="text-sm text-market-ink/65">
              Showing {filteredListings.length} of {listings.length} listings
              {filters.minBalance || filters.maxAsking ? " (filtered)" : ""}
            </div>

            {filteredListings.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-market-ink/10 bg-white shadow-[0_10px_35px_rgba(23,32,27,0.06)]">
                <div className="hidden grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1.8fr_0.9fr] gap-4 border-b border-market-ink/10 bg-[#f7faf5] px-4 py-3 text-sm font-bold text-market-ink/65 md:grid">
                  <span>Seller</span>
                  <span>Meal card balance</span>
                  <span>Asking</span>
                  <span>Discount</span>
                  <span>Meetup note</span>
                  <span className="text-right">Action</span>
                </div>

                {filteredListings.map((listing) => {
                  const discount = getDiscount(
                    listing.balanceAmount,
                    listing.askingPrice
                  );

                  return (
                    <div
                      key={listing.id}
                      className="grid gap-3 border-b border-market-ink/10 px-4 py-4 last:border-b-0 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1.8fr_0.9fr] md:items-center md:gap-4 md:py-3"
                    >
                      <button
                        onClick={() => openListing(listing)}
                        className="text-left text-lg font-black transition hover:text-market-leaf md:text-base"
                      >
                        {listing.sellerName}
                      </button>

                      <div className="grid grid-cols-3 gap-3 md:contents">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-market-ink/45 md:hidden">
                            Meal card balance
                          </p>
                          <p className="font-bold">
                            {money.format(listing.balanceAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-market-ink/45 md:hidden">
                            Asking
                          </p>
                          <p className="font-bold text-market-leaf">
                            {money.format(listing.askingPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-market-ink/45 md:hidden">
                            Discount
                          </p>
                          <p className="font-bold">{discount}%</p>
                        </div>
                      </div>

                      <p className="text-sm leading-6 text-market-ink/65">
                        {listing.locationNote}
                      </p>

                      <button
                        onClick={() => openListing(listing)}
                        className="rounded-md bg-market-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-market-leaf md:justify-self-end"
                      >
                        Buy / Request
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-market-ink/20 bg-white p-8 text-center">
                <h3 className="text-xl font-black">No matching listings</h3>
                <p className="mt-2 text-market-ink/65">
                  Try clearing filters or adjust the minimum balance / maximum asking price.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <h2 className="text-2xl font-black">Recent Requests</h2>
              <p className="text-sm text-market-ink/60">Pending manual meetup</p>
            </div>

            {recentRequests.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-market-ink/10 bg-white">
                <div className="hidden grid-cols-[1.1fr_0.8fr_0.8fr_1.9fr_1fr] gap-4 border-b border-market-ink/10 bg-[#f7faf5] px-4 py-3 text-sm font-bold text-market-ink/65 md:grid">
                  <span>Seller</span>
                  <span>Meal card balance</span>
                  <span>Asking</span>
                  <span>Meetup note</span>
                  <span>Status</span>
                </div>

                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="grid gap-3 border-b border-market-ink/10 px-4 py-4 last:border-b-0 md:grid-cols-[1.1fr_0.8fr_0.8fr_1.9fr_1fr] md:items-center md:gap-4 md:py-3"
                  >
                    <p className="text-lg font-black md:text-base">
                      {request.sellerName}
                    </p>

                    <div className="grid grid-cols-2 gap-3 md:contents">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-market-ink/45 md:hidden">
                          Meal card balance
                        </p>
                        <p className="font-bold">
                          {money.format(request.balanceAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-market-ink/45 md:hidden">
                          Asking
                        </p>
                        <p className="font-bold text-market-leaf">
                          {money.format(request.askingPrice)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-market-ink/65">
                      {request.locationNote}
                    </p>
                    <span className="w-fit rounded-md bg-market-mint px-3 py-2 text-sm font-bold text-market-leaf">
                      Pending meetup
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-market-ink/20 bg-white p-5 text-market-ink/65">
                No requests yet.
              </div>
            )}
          </section>
        ) : null}

        {view === "detail" && selectedListing ? (
          <section className="mx-auto w-full max-w-2xl rounded-lg border border-market-ink/10 bg-white p-6 shadow-[0_10px_35px_rgba(23,32,27,0.08)]">
            <p className="text-sm font-bold uppercase tracking-wide text-market-leaf">
              Transaction detail
            </p>
            <h2 className="mt-3 text-2xl font-black">
              Request {selectedListing.sellerName}&apos;s listing
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-[#f7faf5] p-4">
                <p className="text-sm text-market-ink/60">
                  Meal card balance
                </p>
                <p className="mt-1 text-2xl font-black">
                  {money.format(selectedListing.balanceAmount)}
                </p>
              </div>
              <div className="rounded-md bg-[#f7faf5] p-4">
                <p className="text-sm text-market-ink/60">Asking price</p>
                <p className="mt-1 text-2xl font-black text-market-leaf">
                  {money.format(selectedListing.askingPrice)}
                </p>
              </div>
              <div className="rounded-md bg-[#f7faf5] p-4 sm:col-span-2">
                <p className="text-sm text-market-ink/60">Meetup note</p>
                <p className="mt-1 font-semibold">
                  {selectedListing.locationNote}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-market-amber/40 bg-[#fff8e7] p-4 leading-7 text-market-ink/75">
              Safety reminder: meet in a public, supervised area and follow
              school rules. This prototype does not process payments or connect
              to any school account.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={confirmRequest}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-market-leaf px-5 py-3 font-bold text-white transition hover:bg-[#286b47]"
              >
                Confirm Request
              </button>
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setView("listings");
                }}
                className="inline-flex flex-1 items-center justify-center rounded-md border border-market-ink/15 bg-white px-5 py-3 font-bold text-market-ink transition hover:border-market-leaf/50 hover:text-market-leaf"
              >
                Cancel / Back
              </button>
            </div>
          </section>
        ) : null}

        {view === "create" ? (
          <section className="mx-auto w-full max-w-2xl rounded-lg border border-market-ink/10 bg-white p-6 shadow-[0_10px_35px_rgba(23,32,27,0.08)]">
            <p className="text-sm font-bold uppercase tracking-wide text-market-leaf">
              New listing
            </p>
            <h2 className="mt-3 text-2xl font-black">Create Listing</h2>

            <form onSubmit={submitListing} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-market-ink/70">
                  Seller name
                </span>
                <input
                  required
                  value={form.sellerName}
                  onChange={(event) =>
                    setForm({ ...form, sellerName: event.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-market-ink/15 bg-white px-4 py-3 outline-none transition focus:border-market-leaf"
                  placeholder="e.g. Taylor M."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-market-ink/70">
                    Meal card balance
                  </span>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.balanceAmount}
                    onChange={(event) =>
                      setForm({ ...form, balanceAmount: event.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-market-ink/15 bg-white px-4 py-3 outline-none transition focus:border-market-leaf"
                    placeholder="45"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-market-ink/70">
                    Asking price
                  </span>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.askingPrice}
                    onChange={(event) =>
                      setForm({ ...form, askingPrice: event.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-market-ink/15 bg-white px-4 py-3 outline-none transition focus:border-market-leaf"
                    placeholder="36"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold text-market-ink/70">
                  Location / note
                </span>
                <input
                  required
                  value={form.locationNote}
                  onChange={(event) =>
                    setForm({ ...form, locationNote: event.target.value })
                  }
                  className="mt-2 w-full rounded-md border border-market-ink/15 bg-white px-4 py-3 outline-none transition focus:border-market-leaf"
                  placeholder="e.g. Main cafeteria after period 3"
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-market-leaf px-5 py-3 font-bold text-white transition hover:bg-[#286b47]"
                >
                  Submit Listing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      sellerName: "",
                      balanceAmount: "",
                      askingPrice: "",
                      locationNote: ""
                    });
                    setView("listings");
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-market-ink/15 bg-white px-5 py-3 font-bold text-market-ink transition hover:border-market-leaf/50 hover:text-market-leaf"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}
