export function userReturnTo(requested) {
  return typeof requested === 'string' && /^\/checkout\/[a-z0-9-]+$/.test(requested)
    ? requested : '/user/profile';
}
