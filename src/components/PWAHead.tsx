import { useEffect } from 'react';

export function PWAHead() {
  useEffect(() => {
    // Add PWA meta tags and manifest link to the document head
    const head = document.head;

    // Create and add manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    head.appendChild(manifestLink);

    // Theme color
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#2563eb';
    head.appendChild(themeColorMeta);

    // Mobile web app capable
    const mobileWebAppMeta = document.createElement('meta');
    mobileWebAppMeta.name = 'mobile-web-app-capable';
    mobileWebAppMeta.content = 'yes';
    head.appendChild(mobileWebAppMeta);

    // Apple mobile web app capable
    const appleMobileWebAppMeta = document.createElement('meta');
    appleMobileWebAppMeta.name = 'apple-mobile-web-app-capable';
    appleMobileWebAppMeta.content = 'yes';
    head.appendChild(appleMobileWebAppMeta);

    // Apple mobile web app status bar style
    const appleStatusBarMeta = document.createElement('meta');
    appleStatusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusBarMeta.content = 'default';
    head.appendChild(appleStatusBarMeta);

    // Apple mobile web app title
    const appleTitleMeta = document.createElement('meta');
    appleTitleMeta.name = 'apple-mobile-web-app-title';
    appleTitleMeta.content = 'GAT Certs';
    head.appendChild(appleTitleMeta);

    // Description
    const descriptionMeta = document.createElement('meta');
    descriptionMeta.name = 'description';
    descriptionMeta.content = 'Global Academy of Technology - Certificate Management System. Request and manage your certificates online.';
    head.appendChild(descriptionMeta);

    // Viewport (if not already set)
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (!existingViewport) {
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      head.appendChild(viewportMeta);
    }

    // Update document title
    document.title = 'GAT Certificate Portal';

    // Cleanup function
    return () => {
      head.removeChild(manifestLink);
      head.removeChild(themeColorMeta);
      head.removeChild(mobileWebAppMeta);
      head.removeChild(appleMobileWebAppMeta);
      head.removeChild(appleStatusBarMeta);
      head.removeChild(appleTitleMeta);
      head.removeChild(descriptionMeta);
    };
  }, []);

  return null;
}
