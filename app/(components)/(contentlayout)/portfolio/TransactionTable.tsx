import Link from "next/link";

interface Transaction {
  transactionHash: string;
  type: string;
  transaction?: string;
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
  transactionCursor: string | null;
  nftTransactionCursor: string | null; // Added nftTransactionCursor
  fetchMore: () => void; // Removed cursor parameter to match loadMore
}

const TransactionTable = ({
  transactions,
  transactionCursor,
  nftTransactionCursor,
  fetchMore,
}: TransactionTableProps) => {
  const validTransactions = Array.isArray(transactions) ? transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  return (
    <>
      {validTransactions.length === 0 ? (
        <div className="xl:col-span-12 col-span-full mt-4">
          <div className="min-h-[60vh] flex items-center justify-center bg-white border rounded shadow-sm dark:bg-secondary dark:border-gray-700">
            <div className="text-center">
              <svg
                className="w-10 h-10 text-gray-500 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" x2="2" y1="12" y2="12" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                <line x1="6" x2="6.01" y1="16" y2="16" />
                <line x1="10" x2="10.01" y1="16" y2="16" />
              </svg>
              <p className="mt-5 text-sm text-gray-800 dark:text-gray-300">No transactions found</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-x-6">
          <div className="xl:col-span-12 col-span-full">
            <div className="box">
              <div className="box-body">
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
                                      src="../../assets/images/apps/100m2.png"
                                      alt={tx.type}
                                      className="avatar avatar-rounded ml-4"
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
                              <span className="text-secondary font-semibold">{tx.value}</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {tx.type === "crypto" ? tx.grayValue : ""}
                              </p>
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
                              className="font-medium bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition ti-btn"
                            >
                              View Transaction
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {(transactionCursor || nftTransactionCursor) && ( // Check both cursors
                <div className="box-footer text-center">
                  <button
                    className="ti-btn bg-secondary text-white !font-medium m-0 !me-[0.375rem] btn btn-primary px-6 py-2"
                    onClick={fetchMore} // No cursor parameter needed
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionTable;