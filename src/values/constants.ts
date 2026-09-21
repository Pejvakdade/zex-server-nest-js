/** --------------------------------------------------------------------------------------------------------------------
 * @define application pagination limitations
 */
export const Pagination = {
  minPage: 1,
  defPage: 1,
  maxPage: 999,
  minLimit: 3,
  maxLimit: 100,
  defLimit: 10,
};

/** --------------------------------------------------------------------------------------------------------------------
 * @define the roles allowed into the admin dashboard. One list so no controller retypes it.
 */
import { UserNamespace } from '@src/app/user/namespace/user.namespace';

export const ADMIN_ROLES: Array<UserNamespace.EUserType> = [
  UserNamespace.EUserType.ADMIN,
  UserNamespace.EUserType.STAFF,
];

export const ADMIN_ONLY: Array<UserNamespace.EUserType> = [UserNamespace.EUserType.ADMIN];

/** Customer-only actions — ordering a plan is something staff do *for* a customer, never for themselves. */
export const CLIENT_ONLY: Array<UserNamespace.EUserType> = [UserNamespace.EUserType.CLIENT];

export const ANY_SIGNED_IN: Array<UserNamespace.EUserType> = [
  UserNamespace.EUserType.ADMIN,
  UserNamespace.EUserType.STAFF,
  UserNamespace.EUserType.CLIENT,
];

/** The global route prefix set in main.ts; anything that builds or matches full paths reads it from here. */
export const API_PREFIX = '/api/v1';

/** --------------------------------------------------------------------------------------------------------------------
 * @define hero banner uploads. The public pages render the hero at exactly this height on desktop, so the
 * dashboard asks for — and the upload endpoint insists on — an image of exactly this size.
 */
export const BANNER_WIDTH = 1920;
export const BANNER_HEIGHT = 560;
export const BANNER_MAX_BYTES = 2 * 1024 * 1024;
export const BANNER_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** Served by ServeStaticModule from `public/`, so the URL is the path under that folder. */
export const BANNER_UPLOAD_DIR = 'uploads/banners';

/** --------------------------------------------------------------------------------------------------------------------
 * @define blog cover uploads. Covers are shown as 16:9-ish cards at several sizes, so unlike hero banners only a
 * minimum size is enforced — anything at least this big is accepted and scaled by the browser.
 */
export const BLOG_COVER_MIN_WIDTH = 1200;
export const BLOG_COVER_MIN_HEIGHT = 630;
export const BLOG_COVER_MAX_BYTES = 3 * 1024 * 1024;
export const BLOG_COVER_UPLOAD_DIR = 'uploads/blog';

/** Brand assets (Admin → Settings): logo, favicon, share image. Any size; SVG / ICO accepted alongside raster. */
export const BRAND_MAX_BYTES = 1 * 1024 * 1024;
export const BRAND_MIME_TYPES = [...BANNER_MIME_TYPES, 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
export const BRAND_UPLOAD_DIR = 'uploads/brand';
