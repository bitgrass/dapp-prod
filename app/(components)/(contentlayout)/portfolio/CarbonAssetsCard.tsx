

const CarbonAssetsCard = () => {
  return (
    <div className="grid grid-cols-12 gap-x-6 grayscale opacity-70">
      <div className="xxl:col-span-12 col-span-12">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="xl:col-span-12 col-span-12">
            <div className="box">

              {/* Main row: balance info left, Buy button right */}
              <div className="box-header ">
                <div className="box-title">Carbon Assets</div>
              </div>
              <div className="box text-center">
                <div className="box-body">
                  <span className="avatar avatar-md avatar-rounded me-2">
                    <img src="../../../assets/images/brand-logos/Soon.svg" alt="" />
                  </span>
                  <p className="box-title font-semibold">Coming Soon</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Carbon credits from staked land plots will start generating in 2026. <br/>You’ll be able to track, retire, and earn from your carbon offset impact here.
                  </p>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default CarbonAssetsCard;