import React from "react";
import "./stats-cards.scss";
import { useCurrency } from "../../../../Context/CurrencyContext";

type StatsConfig = {
  key: string; // ⭐ required for mapping stats
  title: string;
  sub: string;
  color: string;
  icon: string;
  isGrad?: boolean;
  click?: () => void;
  showCurrency?: boolean;
};

type Props = {
  stats: Record<string, any>;
  config: StatsConfig[];
  loading?: boolean;
};

const StatsCardsTrezo: React.FC<Props> = ({ stats, config, loading }) => {
  const { currency } = useCurrency();
  return (
    <div className="st-stats">
      {config.map((c, i) => {
        // ✅ Get value from stats using key
        const value = c.key === "+"
          ? "+"
          : (stats?.[c.key] ?? 0);

        return (
          <div
            key={i}
            className={`st-card ${c.isGrad ? "gradient-card" : ""}`}
            onClick={c.click || undefined}
          >
            <div className="st-card-bg" style={{ background: c.color }} />

            {/* Title */}
            <div className={`st-card-label ${c.isGrad ? "white" : ""}`}>
              {c.title}
            </div>

            {/* Value */}
            <div className={`st-card-num ${c.isGrad ? "white" : ""}`}>
              {loading ? (
                <div className="stats-loader" />
              ) : (
                (() => {
                  const formattedValue =
                    c.key === "+" ? value : Number(value).toLocaleString();

                  const shouldShowCurrency = c.showCurrency && c.key !== "+";

                  if (!shouldShowCurrency) return formattedValue;

                  return currency.symbol.length === 1
                    ? `${currency.symbol}${formattedValue}`   // $1
                    : `${formattedValue} ${currency.symbol}`;  // 1USDT
                })()
              )}
            </div>

            {/* Subtitle */}
            <div className={`st-card-sub ${c.isGrad ? "white" : ""}`}>
              {c.sub}
            </div>

            {/* Icon */}
            <div className="st-card-icon">{c.icon}</div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCardsTrezo;