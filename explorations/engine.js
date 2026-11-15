// Prototype pricing engine shared by the three direction explorations.
// shortcut: every rate below is an ASSUMPTION for the prototypes, replace with sourced, editable benchmarks in the real app.
window.KREO = (() => {
  const formats = {
    tiktok: { label: 'TikTok video', cpm: 20, viewShare: 1 },
    reel: { label: 'Instagram Reel', cpm: 22, viewShare: 0.8 },
    youtube: { label: 'YouTube integration', cpm: 30, viewShare: 1.4 },
    story: { label: 'Instagram Story frame', cpm: 10, viewShare: 0.3 },
    post: { label: 'Static post', cpm: 15, viewShare: 0.5 },
  };
  const niches = { beauty: 1.1, lifestyle: 1, finance: 1.5, tech: 1.4, gaming: 0.9, food: 1 };

  const engagementMultiplier = (er) => (er < 2 ? 0.85 : er < 4 ? 1 : er < 6 ? 1.1 : 1.2);

  function quote(input) {
    const eng = engagementMultiplier(input.engagement);
    const niche = niches[input.niche] ?? 1;
    const lines = Object.entries(input.deliverables)
      .filter(([, n]) => n > 0)
      .map(([key, n]) => {
        const f = formats[key];
        const views = input.avgViews * f.viewShare;
        const unit = (views / 1000) * f.cpm * eng * niche;
        return { key, label: f.label, count: n, unit, total: unit * n, why: `${Math.round(views).toLocaleString('en')} expected views × ${f.cpm} per 1,000 × ${eng} engagement × ${niche} niche` };
      });
    const base = lines.reduce((s, l) => s + l.total, 0);
    const usage = base * 0.15 * input.usageMonths;
    const exclusivity = base * 0.1 * input.exclusivityMonths;
    const revisions = base * 0.1 * Math.max(0, input.revisions - 1);
    const target = base + usage + exclusivity + revisions;
    return { lines, base, usage, exclusivity, revisions, target, floor: target * 0.8, anchor: target * 1.25 };
  }

  const money = (n, cur = 'EUR') => new Intl.NumberFormat('en-IE', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Math.round(n / 10) * 10);

  return { formats, niches, quote, money };
})();

// Self-check: sample creator from the explorations must price above zero and keep floor < target < anchor.
{
  const q = window.KREO.quote({ avgViews: 31000, engagement: 6.2, niche: 'beauty', deliverables: { tiktok: 2, reel: 1, story: 3 }, usageMonths: 1, exclusivityMonths: 1, revisions: 1 });
  console.assert(q.target > 0 && q.floor < q.target && q.target < q.anchor, 'KREO engine self-check failed', q);
}
