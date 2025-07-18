import React from 'react';

interface CryptoTableProps {
  ethBalance: string;
  ethPrice: number;
  btgBalance: string;
  btgPrice: number;
}

const CryptoTable = ({ ethBalance, ethPrice, btgBalance, btgPrice }: CryptoTableProps) => {
  return (
    <div className="grid grid-cols-12 gap-x-6">
      <div className="xl:col-span-12 col-span-12">
        <div className="flex flex-col md:flex-row gap-y-3 md:gap-y-0 md:gap-x-6 mb-6">
          {/* Card 1 */}
          <div className="flex items-center border border-[#f3f3f31A] rounded-md w-[200px] h-[78px]  shadow px-4">
            <span className="avatar avatar-md avatar-rounded me-2">
              <img src="../../../assets/images/brand-logos/Standard.svg" alt="" />
            </span>
            <div className="ml-1">
              <div className="font-bold text-xl">0</div>
              <div className="text-[0.68rem] text-[#8c9097] dark:text-white/50 ">Total Standard NFTs</div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex items-center border border-[#f3f3f31A] rounded-md w-[200px] h-[78px]  shadow px-4">
            <span className="avatar avatar-md avatar-rounded me-2">
              <img src="../../../assets/images/brand-logos/Premium.svg" alt="" />
            </span>
            <div className="ml-1">
              <div className="font-bold text-xl">32</div>
              <div className="text-[0.68rem] text-[#8c9097] dark:text-white/50 ">Total Premium NFTs</div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex items-center border border-[#f3f3f31A] rounded-md w-[200px] h-[78px]  shadow px-4">
            <span className="avatar avatar-md avatar-rounded me-2">
              <img src="../../../assets/images/brand-logos/Legendary.svg" alt="" />
            </span>
            <div className="ml-1">
              <div className="font-bold text-xl">2</div>
              <div className="text-[0.68rem] text-[#8c9097] dark:text-white/50 ">Total Legendary NFTs</div>
            </div>
          </div>
        </div>

        <div className="box">
          <div className="table-responsive">
            <table className="table whitespace-nowrap min-w-full">
              <thead>
                <tr>
                  <th scope="row" className="text-start">Asset</th>
                  <th scope="row" className="text-start">Balance</th>
                  <th scope="row" className="text-start">Price</th>
                  <th scope="row" className="text-start">Market Cap</th>

                </tr>
              </thead>
              <tbody>
                <tr className="border !border-x-0 border-defaultborder dark:border-defaultborder/10">
                  <td>
                    <div className="flex items-center">
                      <div className="leading-none">
                        <span className="avatar avatar-md avatar-rounded me-2">
                          <img src="../../../assets/images/brand-logos/eth.png" alt="" />
                        </span>
                      </div>
                      <div className="items-center">
                        <p className="mb-0 font-semibold">
                          ETH<i className="bi bi-patch-check-fill text-secondary ms-2"></i>
                        </p>
                        <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">Ethereum</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="items-center">
                      <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">{ethBalance} ETH</span>
                      <p className="mb-0 font-semibold">${(parseFloat(ethBalance) * ethPrice).toFixed(2)} USD</p>
                    </div>
                  </td>
                  <td>
                    <div className="items-center">
                      <span className="text-secondary font-semibold">
                        1.52%<i className="ri-arrow-up-s-line align-middle ms-1 me-2"></i>
                      </span>
                      <p className="mb-0 font-semibold">${ethPrice} USD</p>
                    </div>
                  </td>
                  <td>
                    <div className="items-center">
                      <span className="text-secondary font-semibold">
                        1.52%<i className="ri-arrow-up-s-line align-middle ms-1 me-2"></i>
                      </span>
                      <p className="mb-0 font-semibold">${ethPrice} USD</p>
                    </div>
                  </td>
                </tr>
                <tr className="border !border-x-0 border-defaultborder dark:border-defaultborder/10">
                  <td>
                    <div className="flex items-center">
                      <div className="leading-none">
                        <span className="avatar avatar-md avatar-rounded me-2">
                          <img src="../../../assets/images/brand-logos/coin-bitgrass.svg" alt="" />
                        </span>
                      </div>
                      <div className="items-center">
                        <p className="mb-0 font-semibold">
                          BTG<i className="bi bi-patch-check-fill text-secondary ms-2"></i>
                        </p>
                        <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">Bitgrass</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="items-center">
                      <span className="text-[0.75rem] text-[#8c9097] dark:text-white/50">{btgBalance} BTG</span>
                      <p className="mb-0 font-semibold">${(parseFloat(btgBalance) * btgPrice).toFixed(2)} USD</p>
                    </div>
                  </td>
                  <td>
                    <div className="items-center">
                      <span className="text-secondary font-semibold">
                        38.52%<i className="ri-arrow-up-s-line align-middle ms-1 me-2"></i>
                      </span>
                      <p className="mb-0 font-semibold">${btgPrice} USD</p>
                    </div>
                  </td>
                  <td>
                    <div className="items-center">
                      <span className="text-secondary font-semibold">
                        1.52%<i className="ri-arrow-up-s-line align-middle ms-1 me-2"></i>
                      </span>
                      <p className="mb-0 font-semibold">${ethPrice} USD</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoTable;