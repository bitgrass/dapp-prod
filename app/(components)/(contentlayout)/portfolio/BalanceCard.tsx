import { Buy } from "@coinbase/onchainkit/buy";
import { Token } from "@coinbase/onchainkit/token";

interface BalanceCardProps {
  totalBalance: string;
  btgBalance: string;
  btgToken: any;
}

const BalanceCard = ({ totalBalance, btgBalance, btgToken }: BalanceCardProps) => {
  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="xxl:col-span-12 col-span-12">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="xl:col-span-12 col-span-12">
            <div className="box mt-6">
              <div className="box-body">
                <div className="">
                  <div>
                    <div className="mb-1">Balance</div>
                    <div className="text-[1.25rem] font-semibold">${totalBalance || "0.00"} USD</div>
                    <small className="text-[#8c9097] dark:text-white/50 font-semibold">
                      {btgBalance || "0.00"} BTG
                    </small>
                  </div>
                </div>
                <div className="mt-4">
                  {/* <div className="alert alert-warning flex items-start mt-3 mb-3 ml-0" role="alert">
                    <svg
                      className="custom-alert-icon fill-warning inline-flex mt-1 me-2"
                      xmlns="http://www.w3.org/2000/svg"
                      height="1.5rem"
                      viewBox="0 0 24 24"
                      width="1.5rem"
                      fill="#0F382B"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                    <div>
                      <div className="text-[0.875rem] mb-1">You’re on testnet!</div>
                      <div className="text-[0.65rem] text-default">Buy shows BTG but actually uses USDC.</div>
                    </div>
                  </div> */}
                  <Buy className="border-none buyToken" toToken={btgToken} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;