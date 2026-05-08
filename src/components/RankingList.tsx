"use client";

interface RankingItem {
  name: string;
  value: number;
}

interface RankingListProps {
  items: RankingItem[];
  maxValue?: number;
}

export default function RankingList({ items, maxValue }: RankingListProps) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="ranking-list">
      {items.map((item, i) => {
        const rank = i + 1;
        const badgeClass =
          rank <= 3 ? `rank-${rank}` : "rank-n";
        return (
          <li key={i} className="ranking-item">
            <span className={`ranking-badge ${badgeClass}`}>{rank}</span>
            <span className="ranking-name">{item.name}</span>
            <div className="ranking-bar-wrap">
              <div
                className="ranking-bar"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
