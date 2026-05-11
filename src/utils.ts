export function estimateCost(entries: number): string {
  // Haiku 4.5: $0.80/MTok in, $4.00/MTok out
  // Sonnet 4: ~$3/MTok in, ~$15/MTok out
  // 2 Haiku calls (ingest + extract), 3 Sonnet calls (cluster + score + synthesize)
  const haikuIn  = (2000 + entries * 50)  * 0.80  / 1_000_000;
  const haikuOut = (400  + entries * 30)  * 4.00  / 1_000_000;
  const sonnetIn  = (3000 + entries * 80) * 3.00  / 1_000_000;
  const sonnetOut = (1600 + entries * 30) * 15.00 / 1_000_000;
  const total = haikuIn + haikuOut + sonnetIn + sonnetOut;
  if (total < 0.01) return '< $0.01';
  return `~$${total.toFixed(2)}`;
}
