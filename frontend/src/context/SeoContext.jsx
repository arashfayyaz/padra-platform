import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { seoAPI } from '../services/api';

const SeoContext = createContext(null);

const DEFAULTS = {
  site_title: 'بلیط یاب — خرید بلیط هواپیما، قطار و اتوبوس',
  title_template: '%s | بلیط یاب',
  meta_description: 'خرید آنلاین بلیط هواپیما، قطار و اتوبوس در ایران',
  meta_keywords: 'بلیط هواپیما, بلیط قطار, بلیط اتوبوس, خرید بلیط آنلاین',
  canonical_url: '',
  og_image: '',
  og_site_name: 'بلیط یاب',
  twitter_handle: '',
  robots_index: true,
  robots_follow: true,
  sitemap_enabled: true,
  google_site_verification: '',
  google_analytics_id: '',
};

// ── کمکی‌ها برای ست‌کردن/به‌روزرسانی تگ‌های <head> بدون کتابخانه اضافی ──
function setMetaByName(name, content) {
  if (!content) { document.querySelector(`meta[name="${name}"]`)?.remove(); return; }
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', name); document.head.appendChild(tag); }
  tag.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
  if (!content) { document.querySelector(`meta[property="${property}"]`)?.remove(); return; }
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag); }
  tag.setAttribute('content', content);
}

function setCanonical(href) {
  if (!href) { document.querySelector('link[rel="canonical"]')?.remove(); return; }
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) { tag = document.createElement('link'); tag.setAttribute('rel', 'canonical'); document.head.appendChild(tag); }
  tag.setAttribute('href', href);
}

function ensureGtag(gaId) {
  if (!gaId) return;
  if (document.getElementById('ga-gtag-src')) return; // قبلاً تزریق شده
  const s1 = document.createElement('script');
  s1.id = 'ga-gtag-src';
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  s2.id = 'ga-gtag-init';
  s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
  document.head.appendChild(s2);
}

export function SeoProvider({ children }) {
  const [seo, setSeo] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const pageOverride = useRef({});
  const location = useLocation();

  const refreshSeo = useCallback(async () => {
    try {
      const res = await seoAPI.get();
      setSeo({ ...DEFAULTS, ...res.data.seo });
    } catch {
      setSeo(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshSeo(); }, [refreshSeo]);

  // تگ‌های سراسری که فقط با تغییر تنظیمات سئو عوض می‌شوند (نه با هر ناوبری)
  useEffect(() => {
    if (loading) return;
    setMetaByName('keywords', seo.meta_keywords);
    setMetaByProperty('og:site_name', seo.og_site_name);
    if (seo.twitter_handle) setMetaByName('twitter:site', seo.twitter_handle.startsWith('@') ? seo.twitter_handle : `@${seo.twitter_handle}`);
    setMetaByName('google-site-verification', seo.google_site_verification);
    if (seo.google_analytics_id) ensureGtag(seo.google_analytics_id);
  }, [loading, seo]);

  const applyPage = useCallback((override) => {
    if (loading) return;
    const ov = override || {};
    const rawTitle = ov.title || seo.site_title;
    const title = ov.title
      ? (seo.title_template || '%s | %s').replace('%s', ov.title)
      : seo.site_title;
    document.title = title;

    const description = ov.description || seo.meta_description;
    setMetaByName('description', description);
    setMetaByProperty('og:title', rawTitle);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:type', ov.type || 'website');
    setMetaByProperty('og:image', ov.image || seo.og_image);
    setMetaByName('twitter:card', (ov.image || seo.og_image) ? 'summary_large_image' : 'summary');
    setMetaByName('twitter:title', rawTitle);
    setMetaByName('twitter:description', description);

    const base = (seo.canonical_url || '').replace(/\/+$/, '');
    const canonical = ov.canonical || (base ? base + location.pathname : '');
    setCanonical(canonical);
    setMetaByProperty('og:url', canonical);

    const noindex = ov.noindex || !seo.robots_index;
    const nofollow = !seo.robots_follow;
    const robotsParts = [noindex ? 'noindex' : 'index', nofollow ? 'nofollow' : 'follow'];
    setMetaByName('robots', robotsParts.join(', '));
  }, [loading, seo, location.pathname]);

  // با هر تغییر مسیر، override صفحه قبلی را پاک کن و تگ‌های سراسری را دوباره اعمال کن.
  // اگر صفحه جدید override اختصاصی دارد، خودش در useEffect خودش صدا می‌زند و این مقدار را بازنویسی می‌کند.
  useEffect(() => {
    pageOverride.current = {};
    applyPage({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, loading, seo]);

  // صفحات این را داخل useEffect خودشان صدا می‌زنند و مقدار بازگشتی را به‌عنوان تابع cleanup برمی‌گردانند:
  //   useEffect(() => setPageMeta({ title, description }), [title, description]);
  const setPageMeta = useCallback((meta) => {
    pageOverride.current = meta || {};
    applyPage(meta);
    return () => { pageOverride.current = {}; };
  }, [applyPage]);

  return (
    <SeoContext.Provider value={{ seo, loading, refreshSeo, setPageMeta }}>
      {children}
    </SeoContext.Provider>
  );
}

export function useSeo() {
  const ctx = useContext(SeoContext);
  if (!ctx) throw new Error('useSeo باید داخل SeoProvider استفاده شود');
  return ctx;
}
