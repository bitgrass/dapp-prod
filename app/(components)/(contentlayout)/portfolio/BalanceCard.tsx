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
                {/* Responsive flex direction */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div>
                    <div className="">Balance</div>
                    <div className="text-[2.25rem] font-semibold">
                      {btgBalance || "0.00"} BTG
                    </div>
                    <small className="text-[1rem] mt-0 text-[#8c9097] dark:text-white/50">
                      ~  ${totalBalance || "0.00"} USD
                    </small>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 w-full md:w-auto">
                    <Buy className="border-none buyToken w-full md:w-auto" toToken={btgToken} />
                  </div>
                </div>
                {/* Optionally add spacing/margin below */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default BalanceCard;