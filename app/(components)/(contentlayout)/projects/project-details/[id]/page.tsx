import { ProjectListdata } from '@/shared/data/apps/jobs/ProjectListdata';
import { Metadata } from 'next';
import ProjectDetails from './ProjectdetailsClient';

interface Params {
  params: { id: string };
}

export async function generateStaticParams() {
  return ProjectListdata.map((project) => ({
    id: project.id.toString(),
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = ProjectListdata.find(p => p.id.toString() === params.id);
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'Project data not found.',
    };
  }

  const title = project.name
  const description =  'Project details page'
  const imageUrl = project.logo ?? '/default-image.png'
  const baseUrl = 'https://optimise-bitgrass-dapp.pages.dev';

   return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} Logo`,
        },
      ],
      url: `${baseUrl}/projects/project-details/${project.id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@YourTwitterHandle',
    },

    other: {
      // "fc:frame": JSON.stringify({
      //   version: "next",
      //   imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      //   button: {
      //     title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
      //     action: {
      //       type: "launch_frame",
      //       name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      //       url: URL,
      //       splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
      //       splashBackgroundColor:
      //         process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      //     },
      //   },
      // }),
      'fc:frame': 'vNext', 
      'fc:frame:image': imageUrl,
      'fc:frame:title': title,
    },
  };
}

export default function Page({ params }: Params) {
  return <ProjectDetails params={params} />;
}
