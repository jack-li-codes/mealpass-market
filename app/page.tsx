"use client";

import { FormEvent, useState } from "react";

type Listing = {
  id: number;
  sellerName: string;
  balanceAmount: number;
  askingPrice: number;
  locationNote: string;
  email: string;
  phone: string;
};

type SellerInfo = {
  totalTransactions: number;
  ratingSum: number;
  reviewCount: number;
};

type View = "listings" | "create" | "detail" | "seller-info";

const initialListings: Listing[] = [
  {
    id: 1,
    sellerName: "Maya R.",
    balanceAmount: 42,
    askingPrice: 34,
    locationNote: "North cafeteria, lunch block transfer",
    email: "maya.r@school.edu",
    phone: "(555) 123-4567"
  },
  {
    id: 2,
    sellerName: "Jordan K.",
    balanceAmount: 28,
    askingPrice: 22,
    locationNote: "Library commons after school",
    email: "jordan.k@school.edu",
    phone: "(555) 234-5678"
  },
  {
    id: 3,
    sellerName: "Sam P.",
    balanceAmount: 65,
    askingPrice: 52,
    locationNote: "Student atrium, best for weekly lunches",
    email: "sam.p@school.edu",
    phone: "(555) 345-6789"
  },
  {
    id: 4,
    sellerName: "Alex T.",
    balanceAmount: 35,
    askingPrice: 28,
    locationNote: "Main hallway by lockers, mornings only",
    email: "alex.t@school.edu",
    phone: "(555) 456-7890"
  },
  {
    id: 5,
    sellerName: "Casey L.",
    balanceAmount: 50,
    askingPrice: 40,
    locationNote: "West building entrance after classes",
    email: "casey.l@school.edu",
    phone: "(555) 567-8901"
  },
  {
    id: 6,
    sellerName: "Riley M.",
    balanceAmount: 72,
    askingPrice: 58,
    locationNote: "Gym bleachers during lunch",
    email: "riley.m@school.edu",
    phone: "(555) 678-9012"
  },
  {
    id: 7,
    sellerName: "Jessie H.",
    balanceAmount: 44,
    askingPrice: 35,
    locationNote: "Library study area, flexible timing",
    email: "jessie.h@school.edu",
    phone: "(555) 789-0123"
  },
  {
    id: 8,
    sellerName: "Morgan B.",
    balanceAmount: 80,
    askingPrice: 64,
    locationNote: "Student center, after 3pm",
    email: "morgan.b@school.edu",
    phone: "(555) 890-1234"
  }
];

const initialSellerInformation: { [key: string]: SellerInfo } = {};

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
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
  const [flexFunds, setFlexFunds] = useState(100);
  const [mealPlanBalance, setMealPlanBalance] = useState(200);
  const [view, setView] = useState<View>("listings");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Listing | null>(null);
  const [sellerInformation, setSellerInformation] = useState<{ [key: string]: SellerInfo }>(initialSellerInformation);
  const [reviewScore, setReviewScore] = useState<number>(5);
  const [reviewedRequestIds, setReviewedRequestIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showContactInfo, setShowContactInfo] = useState(false);

  const selectedSellerInfo = selectedSeller ? sellerInformation[selectedSeller.sellerName] : undefined;

  const [form, setForm] = useState({
    sellerName: "",
    balanceAmount: "",
    askingPrice: "",
    locationNote: "",
    email: "",
    phone: ""
  });

  function openListing(listing: Listing) {
    setSuccessMessage("");
    setSelectedListing(listing);
    setView("detail");
  }

  function openSellerInfo(listing: Listing) {
    setSuccessMessage("");
    setSelectedSeller(listing);
    setView("seller-info");
  }

  function leaveReview(score: number) {
    if (!selectedSeller) return;

    const name = selectedSeller.sellerName;

    setSellerInformation((prev) => {
      const prevInfo = prev[name] ?? { totalTransactions: 0, ratingSum: 0, reviewCount: 0 };

      return {
        ...prev,
        [name]: {
          ...prevInfo,
          ratingSum: prevInfo.ratingSum + score,
          reviewCount: prevInfo.reviewCount + 1
        }
      };
    });

    const unreviewedId = getUnreviewedRequestIdForSeller(name);
    if (unreviewedId) {
      setReviewedRequestIds((prev) => [unreviewedId, ...prev]);
    }

    setSuccessMessage(`Submitted ${score}-star review for ${name}.`);
  }

  function getUnreviewedRequestIdForSeller(name: string): number | null {
    const req = recentRequests.find((r) => r.sellerName === name && !reviewedRequestIds.includes(r.id));
    return req ? req.id : null;
  }

  const hasUnreviewedTransaction =
    selectedSeller != null
      ? getUnreviewedRequestIdForSeller(selectedSeller.sellerName) !== null
      : false;

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
    setFlexFunds((currentBalance) =>
      currentBalance - selectedListing.askingPrice
    );
    setSellerInformation((currentInfo) => {
      const prevInfo = currentInfo[selectedListing.sellerName] ?? {
        totalTransactions: 0,
        ratingSum: 0,
        reviewCount: 0
      };

      return {
        ...currentInfo,
        [selectedListing.sellerName]: {
          ...prevInfo,
          totalTransactions: prevInfo.totalTransactions + 1
        }
      };
    });
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
      !form.email.trim() ||
      !form.phone.trim() ||
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
        locationNote: form.locationNote.trim(),
        email: form.email.trim(),
        phone: form.phone.trim()
      },
      ...currentListings
    ]);
    setForm({
      sellerName: "",
      balanceAmount: "",
      askingPrice: "",
      locationNote: "",
      email: "",
      phone: ""
    });
    setSuccessMessage("Listing created and added to active listings.");
    setView("listings");
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> 
          <div className="rounded-lg border border-market-ink/10 bg-white p-4">
            <p className="text-sm text-market-ink/60">Flex Funds</p>
            <p className="mt-1 text-2xl font-black">
              {money.format(flexFunds)}
            </p>
          </div>

<div className="rounded-lg border border-market-ink/10 bg-white p-4">
  <p className="text-sm text-market-ink/60">Meal Plan Balance</p>
  <p className="mt-1 text-2xl font-black">
    {money.format(mealPlanBalance)}
  </p>
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

            {listings.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-market-ink/10 bg-white shadow-[0_10px_35px_rgba(23,32,27,0.06)]">
                <div className="hidden grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1.8fr_0.9fr] gap-4 border-b border-market-ink/10 bg-[#f7faf5] px-4 py-3 text-sm font-bold text-market-ink/65 md:grid">
                  <span>Seller</span>
                  <span>Meal card balance</span>
                  <span>Asking</span>
                  <span>Discount</span>
                  <span>Meetup note</span>
                  <span className="text-right">Action</span>
                </div>

                {listings.map((listing) => {
                  const discount = getDiscount(
                    listing.balanceAmount,
                    listing.askingPrice
                  );

                  return (
                    <div
                      key={listing.id}
                      className="grid gap-3 border-b border-market-ink/10 px-4 py-4 last:border-b-0 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_1.8fr_0.9fr] md:items-center md:gap-4 md:py-3"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openListing(listing)}
                          className="text-left text-lg font-black transition hover:text-market-leaf md:text-base"
                        >
                          {listing.sellerName}
                        </button>
                        <button
                          onClick={() => openSellerInfo(listing)}
                          className="rounded-md border border-market-ink/20 px-2 py-1 text-xs font-semibold text-market-ink/60 transition hover:border-market-ink/40 hover:bg-market-ink/5"
                        >
                          Info
                        </button>
                      </div>

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
                <h3 className="text-xl font-black">No active listings</h3>
                <p className="mt-2 text-market-ink/65">
                  Create a mock listing to add it to the marketplace.
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
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-black md:text-base">{request.sellerName}</p>
                          <button
                            onClick={() => openSellerInfo(request)}
                            className="rounded-md border border-market-ink/20 px-2 py-1 text-xs font-semibold text-market-ink/60 transition hover:border-market-ink/40 hover:bg-market-ink/5"
                          >
                            Info
                          </button>
                        </div>

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

        {view === "seller-info" && selectedSeller ? (
          <section className="mx-auto w-full max-w-2xl rounded-lg border border-market-ink/10 bg-white p-6 shadow-[0_10px_35px_rgba(23,32,27,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-market-leaf">
                  Seller information
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  {selectedSeller.sellerName}
                </h2>
              </div>
              <button
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="rounded-md bg-market-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-market-leaf"
              >
                Contact Info
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {showContactInfo ? (
                <div className="rounded-md bg-market-mint p-4 border border-market-leaf/30">
                  <p className="text-sm text-market-ink/60">Email</p>
                  <p className="mt-1 font-bold text-market-leaf">{selectedSeller.email}</p>
                  <p className="mt-3 text-sm text-market-ink/60">Phone</p>
                  <p className="mt-1 font-bold text-market-leaf">{selectedSeller.phone}</p>
                </div>
              ) : null}

              <div className="rounded-md bg-[#f7faf5] p-4">
                <p className="text-sm text-market-ink/60">Seller credibility rating</p>
                <p className="mt-2 text-2xl font-black">
                  {selectedSellerInfo?.reviewCount
                    ? (selectedSellerInfo.ratingSum / selectedSellerInfo.reviewCount).toFixed(1)
                    : "—"} ⭐
                </p>
              </div>
              <div className="rounded-md bg-[#f7faf5] p-4">
                <p className="text-sm text-market-ink/60">Total transactions made</p>
                <p className="mt-2 text-2xl font-black">
                  {selectedSellerInfo?.totalTransactions ?? 0}
                </p>
              </div>

              {hasUnreviewedTransaction ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    leaveReview(reviewScore);
                  }}
                  className="mt-2"
                >
                  <label className="block">
                    <span className="text-sm font-bold text-market-ink/70">
                      Leave a review (1-5)
                    </span>
                    <div className="mt-2 flex items-center gap-3">
                      <select
                        value={reviewScore}
                        onChange={(e) => setReviewScore(Number(e.target.value))}
                        className="rounded-md border border-market-ink/15 bg-white px-3 py-2 outline-none transition focus:border-market-leaf"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Good</option>
                        <option value={3}>3 - Okay</option>
                        <option value={2}>2 - Poor</option>
                        <option value={1}>1 - Bad</option>
                      </select>

                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md bg-market-leaf px-4 py-2 font-bold text-white transition hover:bg-[#286b47]"
                      >
                        Submit Review
                      </button>
                    </div>
                  </label>
                </form>
              ) : (
                <div className="rounded-md border border-market-ink/10 bg-[#fff8f5] p-4 text-market-ink/75">
                  <p className="font-semibold">
                    You can only leave a review after completing a transaction with this seller, and only once per request. Leave another review after making a new request.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setSelectedSeller(null);
                  setShowContactInfo(false);
                  setView("listings");
                }}
                className="inline-flex flex-1 items-center justify-center rounded-md border border-market-ink/15 bg-white px-5 py-3 font-bold text-market-ink transition hover:border-market-leaf/50 hover:text-market-leaf"
              >
                Back to Listings
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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-market-ink/70">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-market-ink/15 bg-white px-4 py-3 outline-none transition focus:border-market-leaf"
                    placeholder="e.g. taylor.m@school.edu"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-market-ink/70">
                    Phone
                  </span>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    className="mt-2 w-full rounded-md border border-market-ink/15 bg-white px-4 py-3 outline-none transition focus:border-market-leaf"
                    placeholder="e.g. (555) 123-4567"
                  />
                </label>
              </div>

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
                      locationNote: "",
                      email: "",
                      phone: ""
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
