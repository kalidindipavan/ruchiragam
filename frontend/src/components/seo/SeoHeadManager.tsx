import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Ruchi Ragam';
//const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://ruchiragam.com').replace(/\/$/, '');
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://ruchiragam.vercel.app').replace(/\/$/, '');


const DEFAULT_DESCRIPTION =
  'Ruchi Ragam brings authentic Telugu pickles, homemade flavors, and traditional Indian food crafted with care.';

type SeoMeta = {
  title: string;
  description: string;
  keywords?: string;
};

const routeMeta = (pathname: string): SeoMeta => {
  if (pathname === '/') {
    return {
      title: 'Ruchi Ragam | Authentic Telugu Pickles & Indian Flavors',
      description:
        'Shop handcrafted Telugu pickles and authentic Indian flavors from Ruchi Ragam. Fresh batches, rich tradition, and doorstep delivery.',
      keywords: 'Ruchi Ragam, Telugu pickles, homemade pickles, Indian pickles, Andhra pickles',
    };
  }

  if (pathname.startsWith('/products')) {
    return {
      title: 'Products | Ruchi Ragam',
      description:
        'Browse traditional Ruchi Ragam products including Avakaya, Gongura, and artisanal Telugu specialties.',
      keywords: 'Ruchi Ragam products, Avakaya, Gongura pickle, Indian food online',
    };
  }

  if (pathname === '/about') {
    return {
      title: 'About Us | Ruchi Ragam',
      description:
        'Learn about the story, values, and culinary tradition behind Ruchi Ragam and our authentic Andhra flavors.',
    };
  }

  if (pathname === '/contact' || pathname === '/support') {
    return {
      title: 'Contact & Support | Ruchi Ragam',
      description:
        'Need help with an order or product? Contact the Ruchi Ragam support team for quick assistance.',
    };
  }

  if (pathname === '/faq') {
    return {
      title: 'FAQ | Ruchi Ragam',
      description: 'Get answers to common questions about ingredients, spice levels, delivery, and storage.',
    };
  }

  return {
    title: `${SITE_NAME} | Authentic Indian Flavors`,
    description: DEFAULT_DESCRIPTION,
  };
};

const upsertMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

export default function SeoHeadManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = routeMeta(pathname);
    const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`;

    document.title = meta.title;
    upsertMeta("meta[name='description']", 'name', 'description', meta.description);
    upsertMeta("meta[name='keywords']", 'name', 'keywords', meta.keywords || 'Ruchi Ragam, Indian food');

    upsertMeta("meta[property='og:site_name']", 'property', 'og:site_name', SITE_NAME);
    upsertMeta("meta[property='og:type']", 'property', 'og:type', 'website');
    upsertMeta("meta[property='og:title']", 'property', 'og:title', meta.title);
    upsertMeta("meta[property='og:description']", 'property', 'og:description', meta.description);
    upsertMeta("meta[property='og:url']", 'property', 'og:url', canonical);

    upsertMeta("meta[name='twitter:card']", 'name', 'twitter:card', 'summary_large_image');
    upsertMeta("meta[name='twitter:title']", 'name', 'twitter:title', meta.title);
    upsertMeta("meta[name='twitter:description']", 'name', 'twitter:description', meta.description);

    upsertCanonical(canonical);
  }, [pathname]);

  return null;
}
