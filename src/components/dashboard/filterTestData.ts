// Emails de teste que devem ser desconsiderados nos dashboards
const TEST_EMAILS = ["teste@exemplo.com", "teste@test.com"];

export function isTestCheckout(event: { customer_email?: string | null }): boolean {
  if (!event.customer_email) return false;
  return TEST_EMAILS.includes(event.customer_email.toLowerCase());
}

export function filterRealCheckouts<T extends { customer_email?: string | null }>(events: T[]): T[] {
  return events.filter(e => !isTestCheckout(e));
}
