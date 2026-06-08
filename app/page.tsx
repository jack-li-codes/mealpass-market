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
  status?: "pending" | "completed" | "refunded";
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
  const [reviewedScores, setReviewedScores] = useState<{ [key: number]: number }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingListing, setPendingListing] = useState<Listing | null>(null);
  const [currentUserSellerName, setCurrentUserSellerName] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryRequestId, setDeliveryRequestId] = useState<number | null>(null);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [showAllListings, setShowAllListings] = useState(false);
  const [hasEnteredMarketplace, setHasEnteredMarketplace] = useState(false);

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
            setReviewedScores((prev) => ({ ...prev, [unreviewedId]: score }));
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
            { ...selectedListing, status: "pending" },
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
        setShowFeedbackModal(true);
        setSelectedListing(null);
        setView("listings");
    }
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
        setFilters((f) => ({ ...f, maxAsking: String(flexFunds) }));
    }

    function openDeliveryModal(requestId: number) {
        setDeliveryRequestId(requestId);
        setShowDeliveryModal(true);
    }

    function closeDeliveryModal() {
        setDeliveryRequestId(null);
        setShowDeliveryModal(false);
    }

    function confirmReceived(requestId: number) {
        setRecentRequests((current) =>
            current.map((r) => (r.id === requestId ? { ...r, status: "completed" } : r))
        );
        closeDeliveryModal();
    }

    function reportNotReceived(requestId: number) {
        const req = recentRequests.find((r) => r.id === requestId);
        if (!req) return;

        // Refund buyer
        setFlexFunds((bal) => bal + req.askingPrice);

        // Remove the request from recentRequests
        setRecentRequests((current) => current.filter((r) => r.id !== requestId));

        // Re-add seller's listing back to active listings (remove any status)
        setListings((current) => [{ ...req, status: undefined }, ...current]);

        // Revert seller stats: decrement totalTransactions and any review added for this request
        setSellerInformation((prev) => {
            const prevInfo = prev[req.sellerName];
            if (!prevInfo) return prev;

            const updated: SellerInfo = { ...prevInfo };
            if (updated.totalTransactions && updated.totalTransactions > 0) {
                updated.totalTransactions = updated.totalTransactions - 1;
            }

            const reviewedScore = reviewedScores[requestId];
            if (reviewedScore != null && updated.reviewCount && updated.reviewCount > 0) {
                updated.reviewCount = Math.max(0, updated.reviewCount - 1);
                updated.ratingSum = Math.max(0, updated.ratingSum - reviewedScore);
            }

            return { ...prev, [req.sellerName]: updated };
        });

        // Clean up reviewed ids and scores for this request
        setReviewedRequestIds((prev) => prev.filter((id) => id !== requestId));
        setReviewedScores((prev) => {
            const copy = { ...prev };
            delete copy[requestId];
            return copy;
        });

        setSuccessMessage("Money refunded to your wallet.");
        closeDeliveryModal();
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

        const newListing: Listing = {
            id: Date.now(),
            sellerName: form.sellerName.trim(),
            balanceAmount,
            askingPrice,
            locationNote: form.locationNote.trim(),
            email: form.email.trim(),
            phone: form.phone.trim()
        };

        const existingListing = listings.find(
            (listing) => listing.sellerName === newListing.sellerName
        );
        const availableMealPlanBalance =
            mealPlanBalance + (existingListing?.balanceAmount ?? 0);

        if (balanceAmount > availableMealPlanBalance) {
            setSuccessMessage("Not enough Meal Plan Balance to create this listing.");
            return;
        }

        if (existingListing) {
            setPendingListing(newListing);
            setShowConfirmation(true);
        } else {
            createListing(newListing);
        }
    }

    function createListing(listing: Listing) {
        if (listing.balanceAmount > mealPlanBalance) {
            setSuccessMessage("Not enough Meal Plan Balance to create this listing.");
            return;
        }

        setListings((currentListings) => [listing, ...currentListings]);
        setMealPlanBalance((currentBalance) => currentBalance - listing.balanceAmount);
        setCurrentUserSellerName(listing.sellerName);
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

    function confirmReplacement() {
        if (pendingListing) {
            const existingListing = listings.find(
                (listing) => listing.sellerName === pendingListing.sellerName
            );
            const restoredBalance = existingListing?.balanceAmount ?? 0;

            if (pendingListing.balanceAmount > mealPlanBalance + restoredBalance) {
                setSuccessMessage("Not enough Meal Plan Balance to update this listing.");
                setShowConfirmation(false);
                setPendingListing(null);
                return;
            }

            setListings((currentListings) =>
                currentListings.map((listing) =>
                    listing.sellerName === pendingListing.sellerName
                        ? pendingListing
                        : listing
                )
            );
            setMealPlanBalance(
                (currentBalance) =>
                    currentBalance + restoredBalance - pendingListing.balanceAmount
            );
            setCurrentUserSellerName(pendingListing.sellerName);
            setForm({
                sellerName: "",
                balanceAmount: "",
                askingPrice: "",
                locationNote: "",
                email: "",
                phone: ""
            });
            setSuccessMessage(
                `Listing for ${pendingListing.sellerName} has been updated.`
            );
            setShowConfirmation(false);
            setPendingListing(null);
            setView("listings");
        }
    }

    const deliveryRequest = deliveryRequestId ? recentRequests.find((r) => r.id === deliveryRequestId) ?? null : null;
    // Use filteredListings for what is visible so the UI reflects filters immediately.
    const visibleListings = showAllListings ? filteredListings : filteredListings.slice(0, 5);

  if (!hasEnteredMarketplace) {
    return (
      <main className="min-h-screen bg-[#f7faf5] text-market-ink">
        <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-5 py-10 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-market-leaf">
              Classroom MVP
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-6xl">
              MealPass Market
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-market-ink/70">
              A student marketplace concept for turning unused meal card balance
              into discounted campus food deals.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-market-ink/60">
              Mock data only. No real money, accounts, or school system integration.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setHasEnteredMarketplace(true)}
                className="inline-flex items-center justify-center rounded-md bg-market-leaf px-6 py-3 font-bold text-white transition hover:bg-[#286b47]"
              >
                Enter Marketplace
              </button>
              <button
                onClick={() => {
                  setHasEnteredMarketplace(true);
                  setSuccessMessage("");
                  setSelectedListing(null);
                  setView("create");
                }}
                className="inline-flex items-center justify-center rounded-md border border-market-ink/15 bg-white px-6 py-3 font-bold text-market-ink transition hover:border-market-leaf/40 hover:text-market-leaf"
              >
                Create a Listing
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Browse discounted balances",
                description:
                  "Find mock listings from students with unused meal card balance."
              },
              {
                title: "Create your own listing",
                description:
                  "Post a mock meal card balance with an asking price and meetup note."
              },
              {
                title: "Request and track",
                description:
                  "Request a listing, view recent requests, and see mock balance changes."
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-market-ink/10 bg-white p-5 shadow-[0_10px_35px_rgba(23,32,27,0.06)]"
              >
                <p className="font-black">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-market-ink/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
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
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => setShowWalletPanel((current) => !current)}
              className="inline-flex items-center justify-center rounded-md border border-market-ink/15 bg-white px-5 py-3 font-bold text-market-ink transition hover:border-market-leaf/40 hover:text-market-leaf"
            >
              Wallet
            </button>
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

                        {showWalletPanel ? (
                            <div className="absolute right-0 top-full z-10 mt-3 w-72 rounded-lg border border-market-ink/10 bg-white p-4 shadow-[0_18px_45px_rgba(23,32,27,0.12)]">
                                <div className="grid gap-3">
                                    <div>
                                        <p className="text-sm text-market-ink/60">Flex Funds</p>
                                        <p className="mt-1 text-2xl font-black">
                                            {money.format(flexFunds)}
                                        </p>
                                    </div>
                                    <div className="border-t border-market-ink/10 pt-3">
                                        <p className="text-sm text-market-ink/60">Meal Plan Balance</p>
                                        <p className="mt-1 text-xl font-black">
                                            {money.format(mealPlanBalance)}
                                        </p>
                                    </div>
                                    <p className="text-xs leading-5 text-market-ink/55">
                                        Mock balances only. No real money is used.
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </header>

                {successMessage ? (
                    <div className="rounded-lg border border-market-leaf/20 bg-market-mint px-4 py-3 font-semibold text-market-leaf">
                        {successMessage}
                    </div>
                ) : null}

                {view === "listings" ? (
                    <section className="space-y-5">
                        {/* Title + Filters grouped so filters appear beside title on wide screens */}
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black">Active Listings <span className="text-market-ink/60">({listings.length})</span></h2>
                            </div>

                            {/* Filters UI moved beside the title */}
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
                                            className="ml-2 w-20 rounded-md border border-market-ink/15 bg-white px-3 py-2 outline-none transition focus:border-market-leaf"
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
                                            className="ml-2 w-20 rounded-md border border-market-ink/15 bg-white px-3 py-2 outline-none transition focus:border-market-leaf"
                                        />
                                    </label>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center justify-center rounded-md border border-market-ink/15 bg-white px-3 py-2 font-bold text-market-ink transition hover:border-market-leaf/50 hover:text-market-leaf"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                                <p className="text-sm text-market-ink/60">Mock data only</p>
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

                                {visibleListings.map((listing) => {
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

                                            {currentUserSellerName === listing.sellerName ? (
                                                <div className="rounded-md bg-market-ink/10 px-4 py-2.5 text-sm font-bold text-market-ink/60 md:justify-self-end">
                                                    My Listing
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openListing(listing)}
                                                    className="rounded-md bg-market-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-market-leaf md:justify-self-end"
                                                >
                                                    Buy / Request
                                                </button>
                                            )}
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

                        {listings.length > 5 ? (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowAllListings((current) => !current)}
                                    className="rounded-md border border-market-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-market-ink transition hover:border-market-leaf/40 hover:text-market-leaf"
                                >
                                    {showAllListings ? "Show fewer listings" : "Show more listings"}
                                </button>
                            </div>
                        ) : null}

                        <div className="flex items-center justify-between gap-4 pt-2">
                            <h2 className="text-2xl font-black">Recent Requests <span className="text-market-ink/60">({recentRequests.length})</span></h2>
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
                                        {request.status === "pending" ? (
                                            <button
                                                onClick={() => openDeliveryModal(request.id)}
                                                className="w-fit rounded-md bg-market-mint px-3 py-2 text-sm font-bold text-market-leaf"
                                            >
                                                Pending meetup
                                            </button>
                                        ) : request.status === "completed" ? (
                                            <span className="w-fit rounded-md bg-market-ink/10 px-3 py-2 text-sm font-bold text-market-ink/60">
                                                Completed
                                            </span>
                                        ) : null}
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
                                        : "N/A"} stars
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

                {showConfirmation && pendingListing ? (
                    <section className="mx-auto w-full max-w-2xl rounded-lg border border-market-amber/40 bg-[#fff8e7] p-6 shadow-[0_10px_35px_rgba(23,32,27,0.08)]">
                        <p className="text-sm font-bold uppercase tracking-wide text-market-amber">
                            Confirm replacement
                        </p>
                        <h2 className="mt-3 text-2xl font-black">Replace Existing Listing?</h2>

                        <div className="mt-4 space-y-3 text-market-ink/80">
                            <p>
                                You already have a listing under the name <span className="font-bold">&quot;{pendingListing.sellerName}&quot;</span>.
                            </p>
                            <p>
                                Submitting this new listing will replace your previous one with:
                            </p>
                            <div className="rounded-md bg-white p-3 space-y-2 text-sm">
                                <p><span className="font-semibold">Meal card balance:</span> {money.format(pendingListing.balanceAmount)}</p>
                                <p><span className="font-semibold">Asking price:</span> {money.format(pendingListing.askingPrice)}</p>
                                <p><span className="font-semibold">Meetup note:</span> {pendingListing.locationNote}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={confirmReplacement}
                                className="inline-flex flex-1 items-center justify-center rounded-md bg-market-amber px-5 py-3 font-bold text-white transition hover:bg-[#c99a00]"
                            >
                                Replace Listing
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setPendingListing(null);
                                }}
                                className="inline-flex flex-1 items-center justify-center rounded-md border border-market-ink/15 bg-white px-5 py-3 font-bold text-market-ink transition hover:border-market-leaf/50 hover:text-market-leaf"
                            >
                                Cancel
                            </button>
                        </div>
                    </section>
                ) : null}

                {showDeliveryModal && deliveryRequest ? (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/40" onClick={closeDeliveryModal} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <section className="w-full max-w-md rounded-lg border border-market-amber/40 bg-[#fff8e7] p-6 shadow-[0_10px_35px_rgba(23,32,27,0.08)]">
                                <p className="text-sm font-bold uppercase tracking-wide text-market-amber">
                                    Confirm delivery
                                </p>
                                <h2 className="mt-3 text-2xl font-black">Did you receive the meal pass?</h2>

                                <div className="mt-4 space-y-3 text-market-ink/80">
                                    <p>
                                        If you received the meal pass from {deliveryRequest.sellerName}, click the confirmation button below.
                                    </p>
                                    <div className="rounded-md bg-white p-3 space-y-2 text-sm">
                                        <p><span className="font-semibold">Asking price:</span> {money.format(deliveryRequest.askingPrice)}</p>
                                        <p><span className="font-semibold">Meetup note:</span> {deliveryRequest.locationNote}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={() => confirmReceived(deliveryRequest.id)}
                                        className="inline-flex flex-1 items-center justify-center rounded-md bg-market-leaf px-5 py-3 font-bold text-white transition hover:bg-[#286b47]"
                                    >
                                        I received the meal pass
                                    </button>
                                    <button
                                        onClick={() => reportNotReceived(deliveryRequest.id)}
                                        className="inline-flex flex-1 items-center justify-center rounded-md border border-market-ink/15 bg-white px-5 py-3 font-bold text-market-ink transition hover:border-market-amber/40 hover:text-market-amber"
                                    >
                                        I haven&apos;t received - Refund
                                    </button>
                                    <button
                                        onClick={closeDeliveryModal}
                                        className="inline-flex flex-1 items-center justify-center rounded-md border border-market-ink/15 bg-white px-5 py-3 font-bold text-market-ink transition hover:border-market-leaf/50 hover:text-market-leaf"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </section>
                        </div>
                    </>
                ) : null}
                {view === "create" && !showConfirmation ? (
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
        {showFeedbackModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 className="text-xl font-black">
        Quick Feedback
      </h2>

      <p className="mt-2 text-market-ink/70">
        How was your experience?
      </p>

      <textarea
        className="mt-4 w-full rounded-md border border-market-ink/15 p-3"
        rows={4}
        placeholder="Share your thoughts..."
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setShowFeedbackModal(false)}
          className="rounded-md bg-market-leaf px-4 py-2 font-bold text-white"
        >
          Submit
        </button>

        <button
          onClick={() => setShowFeedbackModal(false)}
          className="rounded-md border border-market-ink/15 px-4 py-2"
        >
          Skip
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </main>
  );
}
