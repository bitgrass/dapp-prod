
interface ProjectListData {
    id: number;
    name: string;
    location: string;
    status: string;
    daysLeftToInvest: number;
    class: string;
    class1: string;
    src: string;
    area :string;
    text1: string;
    statusFontColor:string;
    statusBgColor:string;
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
        statusFontColor:"#23B7E5",
        statusBgColor:"#23B7E51A",
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
        area : "100 Hecrares" ,
        daysLeftToInvest: 45,
        longitude: 10.7603,
        latitude: 34.7406,
        zoom: 13,
        projectData: [
            {
                title: "Removal", subtitle: "Credit Type", icon: ` <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        style="fill: rgb(var(--primary));" viewBox="0 0 24 24" >
                                                        <path d="m5,15h5v6c0,.43.28.82.69.95.1.03.21.05.31.05.31,0,.62-.15.81-.41l8-11c.22-.3.25-.71.08-1.04-.17-.34-.52-.55-.89-.55h-5V3c0-.43-.28-.82-.69-.95-.41-.13-.86.01-1.12.36L4.19,13.41c-.22.3-.25.71-.08,1.04.17.34.52.55.89.55Zm7-8.92v3.92c0,.55.45,1,1,1h4.04l-5.04,6.92v-3.92c0-.55-.45-1-1-1h-4.04l5.04-6.92Z"></path>
                                                    </svg>` },
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
