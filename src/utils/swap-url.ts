//swap the url in place without triggering a route transition. next syncs
//usePathname from native replaceState, so RouteTransition consults this to
//tell a real navigation from a tool quietly updating its own url

let swappedPath: string | null = null;

export function swapUrl(href: string) {
  swappedPath = href.split(/[?#]/)[0];
  window.history.replaceState(null, "", href);
}

export function isSwappedPath(pathname: string) {
  return swappedPath === pathname;
}

export function clearSwappedPath() {
  swappedPath = null;
}
