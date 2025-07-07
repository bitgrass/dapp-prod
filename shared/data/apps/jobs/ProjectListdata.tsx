
interface ProjectListData {
    id: number;
    name: string;
    location: string;
    status: string;
    daysLeftToInvest: number;
    class: string;
    class1: string;
    src: string;
    area: string;
    text1: string;
    statusFontColor: string;
    statusBgColor: string;
    color1: string;
    class2: string; // This is an SVG path; consider renaming to svgPath
    class3: string;
    checked: any;
    data: string;
    data1: string;
    text: string;
    text2: string;
    standard: string;
    color: string;
    number: string;
    number1: string;
    longitude: number,
    latitude: number,
    zoom: number,
    projectData: {
        title: string;
        subtitle: string;
        icon: string;
    }[];
    about: string;
    documents: {
        name: string;
        link: string;
        avatar: string;
    }[];
    logo: string;
    nftStats: {
        totalLandplots: number;
        categories: {
            name: string;
            count: number;
            percentage: number;
        }[];
    };
}

const checked = <input className="form-check-input" type="checkbox" id="checkboxNoLabelproject3" aria-label="..." defaultValue="" defaultChecked />;
const notchecked = <input className="form-check-input" type="checkbox" id="checkboxNoLabelproject2" aria-label="..." defaultValue="" />
export const ProjectListdata: ProjectListData[] = [
    {
        id: 1,
        class: 'Bitgrass Farmland',
        class1: '100 Hectares',
        src: "../../../assets/images/faces/faviconDark1.png",
        text1: 'Puro',
        statusFontColor: "#23B7E5",
        statusBgColor: "#23B7E51A",
        color1: 'secondary',
        class2: 'M21.46777,2.3252A1.00007,1.00007,0,0,0,20.73,2H3.27a1.00039,1.00039,0,0,0-.99609,1.08887l1.52,17a.99944.99944,0,0,0,.72851.87451l7.2002,2A.99628.99628,0,0,0,11.99023,23a1.01206,1.01206,0,0,0,.26709-.03613l7.21973-2a1.00055,1.00055,0,0,0,.729-.875l1.52-17A1,1,0,0,0,21.46777,2.3252Zm-3.19238,16.896L11.99072,20.9624,5.72461,19.22168,4.36328,4H19.63672ZM7.81982,13h6.895l-.32714,3.271-2.56788.917L8.65625,16.05811a1.00017,1.00017,0,1,0-.67285,1.88378l3.5,1.25a1.00291,1.00291,0,0,0,.67285,0l3.5-1.25a1.00044,1.00044,0,0,0,.65869-.84228l.5-5A1.00064,1.00064,0,0,0,15.81982,11H8.72461L8.4248,8h7.895a1,1,0,0,0,0-2h-9a1.00064,1.00064,0,0,0-.99511,1.09961l.5,5A1.00012,1.00012,0,0,0,7.81982,13Z',
        class3: '',
        checked: notchecked,
        data: 'Full Time',
        data1: 'Oct 12 2022',
        text: 'Biomass Removal',
        text2: 'Nov 12 2022',
        color: 'primary',
        standard: '-',
        number: '10', number1: '15',
        name: "Bitgrass Farmland",
        location: "Tunisia",
        status: "Under Developement",
        area: "100 Hecrares",
        daysLeftToInvest: 45,
        longitude: 10.7603,
        latitude: 34.7406,
        zoom: 13,



        projectData: [
            {
                title: "Removal", subtitle: "Credit Type", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="fill: none; stroke: rgb(var(--primary));" viewBox="0 0 24 24">
  <path d="M8 17L12 21L16 17" stroke: rgb(var(--primary));" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 12V21" stroke-width="2" stroke: rgb(var(--primary));" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20.8802 18.0899C21.7496 17.4786 22.4015 16.6061 22.7415 15.5991C23.0814 14.5921 23.0916 13.503 22.7706 12.4898C22.4496 11.4766 21.814 10.592 20.9562 9.9645C20.0985 9.33697 19.063 8.9991 18.0002 8.99993H16.7402C16.4394 7.82781 15.8767 6.73918 15.0943 5.81601C14.3119 4.89285 13.3303 4.15919 12.2234 3.67029C11.1164 3.18138 9.91302 2.94996 8.7037 2.99345C7.49439 3.03694 6.31069 3.3542 5.24173 3.92136C4.17277 4.48852 3.2464 5.29078 2.53236 6.26776C1.81833 7.24474 1.33523 8.37098 1.11944 9.56168C0.903647 10.7524 0.960787 11.9765 1.28656 13.142C1.61233 14.3074 2.19824 15.3837 3.00018 16.2899" stroke: rgb(var(--primary));" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
            {
                title: "60K TCO2", subtitle: "Carbon Units", icon: ` <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         style="fill: rgb(var(--primary));" viewBox="0 0 24 24" >
                                                        <path d="m21.02,3.17c-.24-.04-5.8-.97-8.81,2.04-.67.67-1.14,1.47-1.47,2.3-.17-.24-.35-.47-.56-.69-2.48-2.48-7.03-1.72-7.23-1.69-.42.07-.74.4-.81.81-.03.19-.79,4.75,1.69,7.23,1.52,1.52,3.82,1.82,5.41,1.82.28,0,.53,0,.76-.02v6.02h2v-6.05c.34.03.75.05,1.21.05,1.95,0,4.74-.37,6.58-2.21,3.01-3.01,2.08-8.58,2.04-8.81-.07-.42-.4-.74-.81-.81Zm-11.05,9.81c-1.17.08-3.47.05-4.73-1.21-1.27-1.27-1.29-3.56-1.21-4.74,1.17-.08,3.47-.05,4.73,1.21,1.27,1.27,1.29,3.56,1.21,4.74Zm8.41-1.59c-1.73,1.73-4.9,1.69-6.33,1.57-.12-1.43-.16-4.59,1.57-6.33,1.73-1.73,4.9-1.69,6.33-1.57.12,1.43.16,4.59-1.57,6.33Z"></path>
                                                    </svg> ` },
            {
                title: "100 Ha", subtitle: "Total Hectares Covered", icon: `  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         style="fill: rgb(var(--primary));" viewBox="0 0 24 24" >
                                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M5 19V5h14v14z"></path><path d="M12 9h3v3h2V7h-5zM9 12H7v5h5v-2H9z"></path>
                                                    </svg>` }
        ],
        about: "Bitgrass Farm tokenizes 100 hectares of farmland into a limited collection of 3,200 NFTs. Each NFT grants the Right of Use for Carbon Credits, allowing holders to stake for rewards, boost $BTG APY, or burn to offset their carbon footprint.",
        documents: [
            {
                name: "Document 1",
                link: "https://drive.google.com/uc?id=FILE_ID_1",
                avatar: "../../../assets/images/company-logos/3.png"
            },
            {
                name: "Document 2",
                link: "https://drive.google.com/uc?id=FILE_ID_2",
                avatar: "../../../assets/images/company-logos/6.png"
            },
            {
                name: "Document 3",
                link: "https://drive.google.com/uc?id=FILE_ID_3",
                avatar: "../../../assets/images/company-logos/8.png"
            },
            {
                name: "Document 4",
                link: "https://drive.google.com/uc?id=FILE_ID_4",
                avatar: "../../../assets/images/company-logos/5.png"
            }
        ],
        logo: "/assets/images/apps/profile-pic.jpg",
        nftStats: {
            totalLandplots: 3200,
            categories: [{ name: "Standard", count: 2000, percentage: 70 }, { name: "Premium", count: 800, percentage: 20 }, { name: "Legendary", count: 400, percentage: 10 }]
        }
    },



];
