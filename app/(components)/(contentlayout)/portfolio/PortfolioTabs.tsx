import Link from "next/link";
import TransactionTable from "./TransactionTable";
import CryptoTable from "./CryptoTable";
import NFTTable from "./NFTTable";

interface PortfolioTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  transactions: any[];
  transactionCursor: string | null;
  nftData: any[];
  nftCursor: string | null;
  loadMore: () => void; // Replaced fetchTransactions and fetchMoreNfts with loadMore
  ethBalance: string;
  ethPrice: number;
  btgPrice: number;
  btgBalance: string;
  btgToken: any;
}

const PortfolioTabs = ({
  activeTab,
  setActiveTab,
  transactions,
  transactionCursor,
  nftData,
  nftCursor,
  loadMore,
  ethBalance,
  ethPrice,
  btgPrice,
  btgBalance,
}: PortfolioTabsProps) => {
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="xl:col-span-12 col-span-12">
        <div className="box">
          <div className="box-body !p-0">
            <div className="!p-4 border-b dark:border-defaultborder/10 border-dashed md:flex items-center justify-between nav-div">
              <nav className="-mb-0.5 flex md:space-x-4 rtl:space-x-reverse pb-2 gap-3" role="tablist">
                <Link
                  className={`w-full sm:w-auto flex active ${
                    activeTab === "crypto-tab-pane"
                      ? "hs-tab-active:font-semibold hs-tab-active:text-primary border-b-2 border-primary"
                      : ""
                  } py-2 px-4 text-primary text-sm`}
                  href="#crypto-tab-pane"
                  scroll={false}
                  id="crypto-tab"
                  data-hs-tab="#crypto-tab-pane"
                  aria-controls="crypto-tab-pane"
                  onClick={() => handleTabChange("crypto-tab-pane")}
                >
                  Crypto
                </Link>
                <Link
                  className={`w-full sm:w-auto flex active ${
                    activeTab === "nfts-tab-pane"
                      ? "hs-tab-active:font-semibold hs-tab-active:text-primary border-b-2 border-primary"
                      : ""
                  } py-2 px-4 text-primary text-sm`}
                  href="#nfts-tab-pane"
                  scroll={false}
                  id="nfts-tab"
                  data-hs-tab="#nfts-tab-pane"
                  aria-controls="nfts-tab-pane"
                  onClick={() => handleTabChange("nfts-tab-pane")}
                >
                  NFTs
                </Link>
                <Link
                  className={`w-full sm:w-auto flex active ${
                    activeTab === "transactions-tab-pane"
                      ? "hs-tab-active:font-semibold hs-tab-active:text-primary border-b-2 border-primary"
                      : ""
                  } py-2 px-4 text-primary text-sm`}
                  href="#transactions-tab-pane"
                  scroll={false}
                  id="transactions-tab"
                  data-hs-tab="#transactions-tab-pane"
                  aria-controls="transactions-tab-pane"
                  onClick={() => handleTabChange("transactions-tab-pane")}
                >
                  Transactions
                </Link>
              </nav>
              {/* <div className="flex flex-wrap items-center md:mt-0 justify-evenly gap-6 portfolio-assets">
                <div className="md:text-end">
                  <span className="block font-semibold">Total NFTs Transactions</span>
                  <span className="!text-primary">{nftData.length}</span>
                </div>
                <div className="md:text-end">
                  <span className="block font-semibold">Total $BTG Transactions</span>
                  <span className="!text-secondary">{transactions.length}</span>
                </div>
              </div> */}
            </div>
            <div className="!p-4">
              <div className="tab-content" id="myTabContent">
                <div
                  className={`tab-pane fade ${activeTab === "crypto-tab-pane" ? "show active" : "hidden"} !p-0 !border-0`}
                  id="crypto-tab-pane"
                  role="tabpanel"
                  aria-labelledby="crypto-tab"
                >
                  <CryptoTable
                    ethBalance={ethBalance}
                    ethPrice={ethPrice}
                    btgBalance={btgBalance}
                    btgPrice={btgPrice}
                  />
                </div>
                <div
                  className={`tab-pane fade ${activeTab === "nfts-tab-pane" ? "show active" : "hidden"} !p-0 !border-0`}
                  id="nfts-tab-pane"
                  role="tabpanel"
                  aria-labelledby="nfts-tab"
                >
                  <NFTTable nftData={nftData} nftCursor={nftCursor} fetchMore={loadMore} />
                </div>
                <div
                  className={`tab-pane fade ${activeTab === "transactions-tab-pane" ? "show active" : "hidden"} !p-0 !border-0`}
                  id="transactions-tab-pane"
                  role="tabpanel"
                  aria-labelledby="transactions-tab"
                >
                  <TransactionTable
                    transactions={transactions}
                    transactionCursor={transactionCursor}
                    fetchMore={loadMore}
                  />
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