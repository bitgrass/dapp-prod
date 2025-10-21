import Link from "next/link";
import TransactionTable from "./TransactionTable";
import CryptoTable from "./CryptoTable";
import NFTTable from "./NFTTable";

interface PortfolioTabsProps {
  address: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  transactions: any[];
  allTransactions: any[];
  currentTransactionPage: number;
  totalTransactionPages: number;
  onTransactionPageChange: (page: number) => void;
  nftData: any[];
  allNftData: any[];
  currentNftPage: number;
  totalNftPages: number;
  onNftPageChange: (page: number) => void;
  transactionCursor: string | null;
  nftTransactionCursor: string | null;
  nftCursor: string | null;
  ethBalance: string;
  ethPrice: number;
  btgPrice: number;
  btgBalance: string;
  btgToken: any;
  ethSupply: any;
  ethSupplyLoaded: boolean;
  hasInitialNftLoad: boolean;
  hasInitialTransaction: boolean;
  loadingTx?: boolean;
  loadingNFTs?: boolean;
  loadingNftGrid?: boolean;
  onRefreshNfts?: () => void;
}

const PortfolioTabs = ({
  address,
  activeTab,
  setActiveTab,
  transactions,
  allTransactions,
  currentTransactionPage,
  totalTransactionPages,
  onTransactionPageChange,
  nftData,
  allNftData,
  currentNftPage,
  totalNftPages,
  onNftPageChange,
  transactionCursor,
  nftTransactionCursor,
  nftCursor,
  ethBalance,
  ethPrice,
  btgPrice,
  btgBalance,
  ethSupply,
  ethSupplyLoaded,
  hasInitialNftLoad,
  loadingTx,
  loadingNFTs,
  loadingNftGrid,
  hasInitialTransaction,
  onRefreshNfts,
}: PortfolioTabsProps) => {
  const handleTabChange = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="xl:col-span-12 col-span-12">
        <div className="box">
          <div className="box-body !p-0">
            {/* ---------- Tabs Navigation ---------- */}
            <div className="!p-4 border-b dark:border-defaultborder/10 border-dashed md:flex items-center justify-between nav-div">
              <nav
                className="-mb-0.5 flex md:space-x-4 rtl:space-x-reverse pb-2 gap-3"
                role="tablist"
              >
                <button
                  type="button"
                  className={`w-full sm:w-auto flex active ${
                    activeTab === "crypto-tab-pane"
                      ? "hs-tab-active:font-semibold hs-tab-active:text-primary border-b-2 border-primary"
                      : "dark:text-white"
                  } py-2 px-4 text-primary text-sm cursor-pointer`}
                  id="crypto-tab"
                  data-hs-tab="#crypto-tab-pane"
                  aria-controls="crypto-tab-pane"
                  onClick={(e) => handleTabChange(e, "crypto-tab-pane")}
                >
                  Overview
                </button>
                <button
                  type="button"
                  className={`w-full sm:w-auto flex active ${
                    activeTab === "nfts-tab-pane"
                      ? "hs-tab-active:font-semibold hs-tab-active:text-primary border-b-2 border-primary"
                      : "dark:text-white"
                  } py-2 px-4 text-primary text-sm cursor-pointer`}
                  id="nfts-tab"
                  data-hs-tab="#nfts-tab-pane"
                  aria-controls="nfts-tab-pane"
                  onClick={(e) => handleTabChange(e, "nfts-tab-pane")}
                >
                  NFTs
                </button>
                <button
                  type="button"
                  className={`w-full sm:w-auto flex active ${
                    activeTab === "transactions-tab-pane"
                      ? "hs-tab-active:font-semibold hs-tab-active:text-primary border-b-2 border-primary"
                      : "dark:text-white"
                  } py-2 px-4 text-primary text-sm cursor-pointer`}
                  id="transactions-tab"
                  data-hs-tab="#transactions-tab-pane"
                  aria-controls="transactions-tab-pane"
                  onClick={(e) => handleTabChange(e, "transactions-tab-pane")}
                >
                  Transactions
                </button>
              </nav>
            </div>

            {/* ---------- Tab Content ---------- */}
            <div className="!p-4">
              <div className="tab-content" id="myTabContent">
                {/* ---------- Overview ---------- */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "crypto-tab-pane" ? "show active" : ""
                  } !p-0 !border-0`}
                  style={{ display: activeTab === "crypto-tab-pane" ? "block" : "none" }}
                  id="crypto-tab-pane"
                  role="tabpanel"
                  aria-labelledby="crypto-tab"
                >
                  {(loadingNftGrid || !ethSupplyLoaded) ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="spinner"></div>
                      <p className="mt-3 text-sm">Loading data, please wait...</p>
                    </div>
                  ) : (
                    <CryptoTable
                      address={address}
                      ethBalance={ethBalance}
                      ethPrice={ethPrice}
                      btgBalance={btgBalance}
                      btgPrice={btgPrice}
                      ethSupply={ethSupply}
                    />
                  )}
                </div>

                {/* ---------- NFTs ---------- */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "nfts-tab-pane" ? "show active" : ""
                  } !p-0 !border-0`}
                  style={{ display: activeTab === "nfts-tab-pane" ? "block" : "none" }}
                  id="nfts-tab-pane"
                  role="tabpanel"
                  aria-labelledby="nfts-tab"
                >
                  {/* Refresh Button */}
                  
     
                  <NFTTable
                    nftData={nftData}
                    allNftData={allNftData}
                    currentPage={currentNftPage}
                    totalPages={totalNftPages}
                    onPageChange={onNftPageChange}
                    loading={loadingNftGrid}
                    hasInitiallyLoaded={hasInitialNftLoad}
                  />
                </div>

                {/* ---------- Transactions ---------- */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "transactions-tab-pane"
                      ? "show active"
                      : ""
                  } !p-0 !border-0`}
                  style={{ display: activeTab === "transactions-tab-pane" ? "block" : "none" }}
                  id="transactions-tab-pane"
                  role="tabpanel"
                  aria-labelledby="transactions-tab"
                >
                  {loadingTx ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="spinner"></div>
                      <p className="mt-3 text-sm">
                        Loading transactions, please wait...
                      </p>
                    </div>
                  ) : (
                    <TransactionTable
                      transactions={transactions}
                      allTransactions={allTransactions}
                      currentPage={currentTransactionPage}
                      totalPages={totalTransactionPages}
                      onPageChange={onTransactionPageChange}
                      loading={loadingTx}
                      hasInitiallyLoaded={hasInitialTransaction}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTabs;