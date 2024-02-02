interface Props {
  title?: string
  description?: string
  author?: string
  image?: string
  keyword?: string
  asPath?: string
}

const Meta = ({
  title = 'Admin',
  description = `I love building software that helps people and businesses grow. I'm a full-stack developer, designer, and entrepreneur. I specialize in building web and mobile applications.
  `,
  image: outsideImage = '/public/img/profile.png',
  asPath = '/',
  author = 'Gus',
  keyword = 'Gus',
}: Props) => {
  const url = `https://chrona.me${asPath}`
  const image = outsideImage

  return {
    // viewport: {
    //   width: 'device-width',
    //   initialScale: 1,
    //   maximumScale: 1,
    // },
    title: title ? title : title,
    description: description ? description : description,
    image: image,

    metadataBase: new URL('https://chrona.me'),
    alternates: {
      canonical: url,
      languages: {
        'en-US': '/en-US',
      },
    },
    openGraph: {
      type: 'website',
      images: image,
      title: title ? title : title,
      description: description ? description : description,
    },
    keywords: [
      `${keyword} Next.js, Web & Mobile Development, App Development, Design Agency, Web Design, eCommerce, Websites, Web Solutions, Business Growth, Software Development, Custom Software Development, Custom Web Design, SEO Optimization, Marketing,
    Branding, USSD, EVC Plus`,
    ],
    authors: [
      {
        name: author ? author : author,
        url: 'https://chrona.me',
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
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icon: '/logo.png',
    twitter: {
      card: 'summary_large_image',
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
        name: 'twitter_app',
        id: {
          iphone: 'twitter_app://iphone',
          ipad: 'twitter_app://ipad',
          googleplay: 'twitter_app://googleplay',
        },
        url: {
          iphone: image,
          ipad: image,
        },
      },
    },
    appleWebApp: {
      title: title ? title : title,
      statusBarStyle: 'black-translucent',
      startupImage: [
        '/logo.png',
        {
          url: '/logo.png',
          media: '(device-width: 768px) and (device-height: 1024px)',
        },
      ],
    },
    verification: {
      google: 'google',
      yandex: 'yandex',
      yahoo: 'yahoo',
      other: {
        me: ['gus@chrona.me', 'http://chrona.me'],
      },
    },
  }
}
export default Meta
