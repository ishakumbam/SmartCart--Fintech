export function calculateReceiptPoints(total: number, itemCount: number): number {
  const spendPoints = Math.max(10, Math.round(total));
  const basketBonus = itemCount >= 8 ? 20 : itemCount >= 5 ? 10 : 0;
  return spendPoints + basketBonus;
}
