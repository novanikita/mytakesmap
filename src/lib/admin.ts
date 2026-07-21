/** Показывать UI добавления только на инстансе администратора */
export function isAdminClient(): boolean {
  return process.env.NEXT_PUBLIC_IS_ADMIN === "true";
}

export function getAdminHeaders(): HeadersInit {
  const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  if (!secret) return {};
  return { "x-admin-secret": secret };
}
