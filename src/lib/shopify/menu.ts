import { shopifyFetch } from './client';
import { MENU_QUERY } from './queries';
import { Menu } from './types';

export async function getMenu(handle: string): Promise<Menu | null> {
  try {
    const data = await shopifyFetch<{ menu: Menu | null }>({
      query: MENU_QUERY,
      variables: { handle },
      tags: [`menu-${handle}`, 'menus'],
      // Menu rarely changes, cache for longer
      revalidate: 3600, // 1 hour
    });
    return data.menu;
  } catch (error) {
    console.error(`Error fetching menu "${handle}":`, error);
    return null;
  }
}

// Fetch multiple menus at once
export async function getMenus(handles: string[]): Promise<Record<string, Menu | null>> {
  const results: Record<string, Menu | null> = {};

  await Promise.all(
    handles.map(async (handle) => {
      results[handle] = await getMenu(handle);
    })
  );

  return results;
}

// Convert Shopify URL to relative path
export function normalizeUrl(url: string): string {
  if (!url) return '/';

  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // Already a relative URL
    return url.startsWith('/') ? url : `/${url}`;
  }
}
