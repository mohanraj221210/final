import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://jit.college';
const OG_IMAGE = `${SITE_URL}/og-preview.png`;

const DEFAULT_TITLE = 'JIT Permigo — Smart Campus Management Portal';
const DEFAULT_DESCRIPTION =
  'JIT Permigo is the official digital campus management portal of Jeppiaar Institute of Technology. Manage outpass requests, track subjects, coordinate staff, and access college services — all in one place.';
const DEFAULT_KEYWORDS =
  'JIT Permigo, Jeppiaar Institute of Technology, JIT college portal, student outpass management, campus management system, JIT student portal, JIT staff portal, JIT outpass, JIT Chennai';

interface SEOProps {
  /** Page title — auto-appended with "| JIT Permigo" unless it is already the default */
  title?: string;
  /** Unique meta description for this page */
  description?: string;
  /** Additional comma-separated keywords */
  keywords?: string;
  /** Canonical path (e.g. "/login"). Defaults to "/" */
  canonical?: string;
  /**
   * Set to true for any page that should NOT be indexed by search engines.
   * Applies `noindex, nofollow` to all login pages and every authenticated route.
   */
  noIndex?: boolean;
  /** Override the Open Graph image. Defaults to the shared OG preview card. */
  ogImage?: string;
}

/**
 * Drop-in SEO component — uses react-helmet-async to manage <head> per page.
 *
 * Usage:
 *   <SEO title="Dashboard" noIndex />
 *   <SEO title="Welcome" description="..." canonical="/" />
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical = '/',
  noIndex = false,
  ogImage = OG_IMAGE,
}) => {
  const pageTitle = title ? `${title} | JIT Permigo` : DEFAULT_TITLE;
  const canonicalURL = `${SITE_URL}${canonical}`;
  const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet>
      {/* ── Primary Meta ──────────────────────────────────────────── */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Jeppiaar Institute of Technology" />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalURL} />

      {/* ── Open Graph ────────────────────────────────────────────── */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="JIT Permigo" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalURL} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="JIT Permigo — Smart Campus Management Portal" />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter Card ──────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="JIT Permigo — Smart Campus Management Portal" />
    </Helmet>
  );
};

export default SEO;
