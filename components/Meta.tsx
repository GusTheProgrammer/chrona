interface Props {
  title?: string;
  description?: string;
  author?: string;
  image?: string;
  keyword?: string;
  asPath?: string;
}

const Meta = ({
  title = "chrona.",
  description = `Chrona, the premier workforce management tool, streamlines scheduling and simplifies time-off tracking to enhance operational efficiency and employee satisfaction.`,
  image: outsideImage = "/public/img/chrona-logo.png",
  asPath = "/",
  author = "Gus Shaal",
  keyword = "Workforce Management, Scheduling, Time-Off Tracking, Employee Management, Employee Scheduling, Team Management, Chrona, Gus Shaal, Chrona.me, Chrona Website, Chrona App, Chrona Development, Chrona Design, Chrona Solutions, Chrona Business Growth, Chrona Software Development, Chrona Custom Software Development, Chrona Custom Web Design, Chrona SEO Optimization, Chrona Marketing, Chrona Branding, Chrona USSD, Chrona EVC Plus, Chrona Web & Mobile Development, Chrona App Development, Chrona Design Agency, Chrona Web Design, Chrona eCommerce, Chrona Websites, Chrona Web Solutions, Chrona Business Growth, Chrona Software Development, Chrona Custom Software Development, Chrona Custom Web Design, Chrona SEO Optimization, Chrona Marketing, Chrona Branding, Chrona USSD, Chrona EVC Plus, Gus Shaal, Gus Shaal Website, Gus Shaal App, Gus Shaal Development, Gus Shaal Design, Gus Shaal Solutions, Gus Shaal Business Growth, Gus Shaal Software Development, Gus Shaal Custom Software Development, Gus Shaal Custom Web Design, Gus Shaal SEO Optimization, Gus Shaal Marketing, Gus Shaal Branding, Gus Shaal USSD, Gus Shaal EVC Plus, Gus Shaal Web & Mobile Development, Gus Shaal App Development, Gus Shaal Design Agency, Gus Shaal Web Design, Gus Shaal eCommerce, Gus Shaal Websites, Gus Shaal Web Solutions, Gus Shaal Business Growth, Gus Shaal Software Development, Gus Shaal Custom Software Development, Gus Shaal Custom Web Design, Gus Shaal SEO Optimization, Gus Shaal Marketing, Gus Shaal Branding, Gus Shaal USSD, Gus Shaal EVC Plus",
}: Props) => {
  const url = `https://chrona.me${asPath}`;
  const image = outsideImage;

  return {
    // viewport: {
    //   width: 'device-width',
    //   initialScale: 1,
    //   maximumScale: 1,
    // },
    title: title ? title : title,
    description: description ? description : description,
    image: image,

    metadataBase: new URL("https://chrona.me"),
    alternates: {
      canonical: url,
      languages: {
        "en-US": "/en-US",
      },
    },
    openGraph: {
      type: "website",
      images: image,
      title: title ? title : title,
      description: description ? description : description,
    },
    keywords: [keyword],
    authors: [
      {
        name: author ? author : author,
        url: "https://chrona.me",
      },
    ],
    publisher: author ? author : author,
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icon: "/public/img/chrona-logo.png",
    twitter: {
      card: "summary_large_image",
      title: title ? title : title,
      description: description ? description : description,
      // siteId: '1467726470533754880',
      // creatorId: '1467726470533754880',
      creator: `@${author ? author : author}`,
      images: {
        url: image,
        alt: title ? title : title,
      },
      app: {
        name: "twitter_app",
        id: {
          iphone: "twitter_app://iphone",
          ipad: "twitter_app://ipad",
          googleplay: "twitter_app://googleplay",
        },
        url: {
          iphone: image,
          ipad: image,
        },
      },
    },
    appleWebApp: {
      title: title ? title : title,
      statusBarStyle: "black-translucent",
      startupImage: [
        "/public/img/chrona-logo.png",
        {
          url: "/public/img/chrona-logo.png",
          media: "(device-width: 768px) and (device-height: 1024px)",
        },
      ],
    },
    verification: {
      google: "google",
      yandex: "yandex",
      yahoo: "yahoo",
      other: {
        me: ["gus@chrona.me", "http://chrona.me"],
      },
    },
  };
};
export default Meta;
