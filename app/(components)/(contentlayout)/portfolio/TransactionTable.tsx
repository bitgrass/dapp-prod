import React from "react";
import Link from "next/link";

interface Transaction {
  transactionHash: string;
  type: string; // "crypto" | "nft"
  transaction?: string;
  NftType?: string;
  grayValue?: string;
  value: string;
  date: string;
  sold?: {
    logo: string;
    symbol: string;
  };
  bought?: {
    logo: string;
    symbol: string;
  };
}

interface TransactionTableProps {
  transactions?: Transaction[];
  allTransactions?: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  hasInitiallyLoaded?: boolean;
}

const TransactionTable = ({
  transactions,
  allTransactions,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  hasInitiallyLoaded = false,
}: TransactionTableProps) => {
  const validTransactions = Array.isArray(transactions) ? transactions : [];

  const NFT_TYPE_IMAGES: Record<string, string> = {
    "Legendary 1000m²": "/assets/images/brand-logos/Legendary.svg",
    "Premium 500m²": "/assets/images/brand-logos/Premium.svg",
    "Standard 100m²": "/assets/images/brand-logos/Standard.svg",
  };

  // 1️⃣ Initial loading state - show spinner when initially loading OR when loading and no data has been loaded yet
  if (loading && !hasInitiallyLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <p className="ml-3 text-sm">Loading transactions, please wait...</p>
      </div>
    );
  }

  // 2️⃣ Loaded but no transactions - only show this if we've completed initial load and have no data
  if (hasInitiallyLoaded && validTransactions.length === 0) {
    return (
      <div className="xl:col-span-12 col-span-full mt-4">
        <div className="min-h-[60vh] flex items-center justify-center bg-camel rounded shadow-sm">
          <div className="text-center">
            <svg
              className="w-10 h-10 text-gray-500 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
            >
              <line x1="22" x2="2" y1="12" y2="12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            <p className="mt-5 text-sm text-gray-800 dark:text-gray-300">
              No transactions found
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3️⃣ Transactions exist
  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="xl:col-span-12 col-span-full">
        <div className="box">
          <div className="box-body p-0">
            <div className="table-responsive">
              <table className="table whitespace-nowrap min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Transaction</th>
                      <th className="text-left">Value</th>
                      <th className="text-left">Date</th>
                      <th className="text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {validTransactions.map((tx, index) => (
                      <tr
                        key={tx.transactionHash || `tx-${index}`}
                        className="border !border-t-0 !border-x-0 border-b border-gray-200 dark:border-gray-700"
                      >
                        <td>
                          <div className="flex items-center">
                            <div className="leading-none">
                              <span className="avatar avatar-md avatar-rounded me-2">
                                {tx.type === "crypto" ? (
                                  <div className="flex -space-x-5">
                                    <img
                                      className="avatar avatar-rounded border-2 border-transparent"
                                      src={tx.sold?.logo}
                                      alt={tx.sold?.symbol}
                                    />
                                    <img
                                      className="avatar avatar-rounded border-2 border-transparent"
                                      src={tx.bought?.logo}
                                      alt={tx.bought?.symbol}
                                    />
                                  </div>
                                ) : (
                                  <img
                                    src={
                                      (tx.NftType &&
                                        NFT_TYPE_IMAGES[tx.NftType]) ||
                                      "/assets/images/faces/NFTTransaction.svg"
                                    }
                                    alt={tx.NftType || tx.type}
                                    className="avatar avatar-md avatar-rounded"
                                    width={40}
                                    height={40}
                                  />
                                )}
                              </span>
                            </div>
                            <div className="items-center ml-5">
                              <p className="mb-0 font-semibold">
                                {tx.type === "crypto" ? "Swapped" : tx.transaction}
                                <i className="bi bi-patch-check-fill text-secondary ms-2"></i>
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {tx.type === "crypto" ? tx.transaction : tx.grayValue}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="items-center">
                            <div className="flex flex-col">
                              <span
                                className={`font-semibold ${
                                  tx.value.startsWith("-")
                                    ? "text-red-500"
                                    : "text-secondary"
                                }`}
                              >
                                {tx.value}
                              </span>
                              {tx.type === "nft" && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {tx.NftType}
                                </span>
                              )}
                            </div>
                            {tx.type === "crypto" && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {tx.grayValue}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <p className="mb-0 font-semibold">{tx.date}</p>
                        </td>
                        <td>
                          <Link
                            href={`https://basescan.org/tx/${tx.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary text-[0.75em] rounded-sm !py-[0.25rem] !px-[0.45rem] badge !bg-secondary/10 ms-1"
                          >
                            View Transaction
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="box-footer">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  {/* Page Info - Centered on mobile, left on desktop */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
                    Showing page {currentPage} of {totalPages} ({allTransactions?.length || 0} total transactions)
                  </div>
                  
                  {/* Pagination Buttons - Centered on mobile and desktop */}
                  <nav aria-label="Transaction pagination" className="w-full md:w-auto flex justify-center">
                    <ul className="ti-pagination mb-0 flex items-center gap-2 flex-wrap justify-center">
                      <li className="page-item">
                        <button
                          className={`page-link px-2 py-1.5 md:px-3 md:py-2 rounded transition-colors text-sm ${
                            currentPage === 1 
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                              : 'bg-white dark:bg-bodybg hover:bg-secondary hover:text-white'
                          }`}
                          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <li key={pageNum} className="page-item">
                            <button
                              className={`page-link px-2 py-1.5 md:px-3 md:py-2 rounded font-semibold transition-colors text-sm ${
                                currentPage === pageNum 
                                  ? '!bg-secondary !text-white shadow-md border-secondary' 
                                  : 'bg-white dark:bg-bodybg hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => onPageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className="page-item">
                        <button
                          className={`page-link px-2 py-1.5 md:px-3 md:py-2 rounded transition-colors text-sm ${
                            currentPage === totalPages 
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                              : 'bg-white dark:bg-bodybg hover:bg-secondary hover:text-white'
                          }`}
                          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;