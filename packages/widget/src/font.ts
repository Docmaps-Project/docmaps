export function loadFont() {
  // Load IBM Plex Mono font
  // It would be nice to do this in styles.ts, but `@import` is not supported there.
  addLinkToDocumentHeader('preconnect', 'https://fonts.googleapis.com');
  addLinkToDocumentHeader('preconnect', 'https://fonts.gstatic.com', 'anonymous');
  addLinkToDocumentHeader(
    'stylesheet',
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap',
  );
}

function addLinkToDocumentHeader(rel: string, href: string, crossorigin?: string) {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }
  document.head.appendChild(link);
}
