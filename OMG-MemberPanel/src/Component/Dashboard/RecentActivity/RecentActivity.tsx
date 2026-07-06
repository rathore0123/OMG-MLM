import React from "react";
// import "./RecentActivity.scss";

interface ActivityItem {
  type: string;
  desc: string;
  sub: string;
  amount: string;
  status: "Success" | "Pending" | "Failed";
  time: string;
}

interface Props {
  data: ActivityItem[];
}

const typeIcon: Record<string, string> = {
  deposit:  "⬇️",
  referral: "👥",
  withdraw: "⬆️",
  level:    "🏆",
  default:  "💳",
};

const RecentActivity = ({ data = [] }: Props) => (
  <div className="recent-activity-card dash-card">
    <div className="dash-card-header">
      <h5>Recent Activity</h5>
      <button>View All Activity</button>
    </div>

    <div className="ra-table-wrap">
      <table className="ra-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>
                <span className="ra-type-icon">
                  {typeIcon[row.type] ?? typeIcon.default}
                </span>
              </td>
              <td>
                <p className="ra-desc">{row.desc}</p>
                <span className="ra-sub">{row.sub}</span>
              </td>
              <td>
                <span className={`ra-amount ${row.amount.startsWith("-") ? "neg" : "pos"}`}>
                  {row.amount}
                </span>
              </td>
              <td>
                <span className={`ra-badge ra-badge--${row.status.toLowerCase()}`}>
                  {row.status}
                </span>
              </td>
              <td>
                <span className="ra-time">{row.time}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default RecentActivity;
