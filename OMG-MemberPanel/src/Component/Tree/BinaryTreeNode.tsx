import React from "react";
import { dynamicImage } from "../../Service";
import { LuPlus } from "react-icons/lu";

// Define the structure of props the component accepts
interface UserDescription {
  Sponsor?: string;
  Reg_Date?: string;
  Bot_Status?: string;
  Bot_Activation_Date?: string;
  totalleftTeamCount?: number;
  totalRightTeamCount?: number;
  leftTeamCount?: number;
  rightTeamCount?: number;
  leftRemainingTeamCount?: number;
  rightRemaining?: number;
  totalInvestmentAmount?: number;
  leftMemberCount?: number;
  rightMemberCount?: number;
}

interface User {
  id: string | number;
  username: string;
  image: string;
  left_child_id?: string | number | null;
  right_child_id?: string | number | null;
  description?: UserDescription;
  paidstatus?: string;
}

interface BinaryTreeNodeProps {
  user: User;
  allUsers: User[];
  deep: number;
  maxDeep?: number;
  renderDetail?: (user: User) => JSX.Element;
  renderNode?: (user: User) => JSX.Element;
  onClick?: (id: string | number) => void;
  colorText?: string;
  imageFake?: string;
  nameFake?: string;
}
function handleHover(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement;
  const popup = card.querySelector(".distributor-details") as HTMLElement;

  if (!popup) return;

  const isMobile = window.innerWidth <= 768;

  // 🔥 MOBILE: always center
  if (isMobile) {
    popup.classList.add("show");
    return;
  }

  const rect = card.getBoundingClientRect();

  const spaceRight = window.innerWidth - rect.right;
  const spaceTop = rect.top;
  const spaceBottom = window.innerHeight - rect.bottom;

  // reset
  popup.classList.remove(
    "pos-right",
    "pos-left",
    "align-top",
    "align-bottom",
    "align-center",
  );

  // 👉 LEFT / RIGHT
  if (spaceRight > 320) {
    popup.classList.add("pos-right");
  } else {
    popup.classList.add("pos-left");
  }

  // 👉 TOP / CENTER / BOTTOM
  if (spaceTop < 100) {
    popup.classList.add("align-top");
  } else if (spaceBottom < 100) {
    popup.classList.add("align-bottom");
  } else {
    popup.classList.add("align-center");
  }

  popup.classList.add("show");
}

export default class BinaryTreeNode extends React.Component<BinaryTreeNodeProps> {
  render() {
    const {
      user,
      allUsers,
      deep,
      maxDeep = 4,
      renderDetail,
      renderNode,
      onClick,
      colorText = "var(--card-text-color)",
      imageFake = "/plus.png",
      nameFake = "Blank",
    } = this.props;

    const fakeUser: User = {
      id: "null",
      username: nameFake,
      left_child_id: null,
      right_child_id: null,
      image: imageFake,
    };

    let leftChild =
      allUsers.find((item) => item.id === user.left_child_id) || fakeUser;
    let rightChild =
      allUsers.find((item) => item.id === user.right_child_id) || fakeUser;
    const imageBaseUrl = import.meta.env.VITE_IMAGE_PREVIEW_URL;
    return (
      <li>
        {colorText && (
          <a
            href="javascript:void(0)"
            onClick={(e) => {
              onClick && onClick(user.id);

              // 👉 MOBILE toggle
              if (window.innerWidth <= 768) {
                const card = e.currentTarget as HTMLElement;
                const popup = card.querySelector(
                  ".distributor-details",
                ) as HTMLElement;

                if (popup) {
                  popup.classList.toggle("show");
                }
              }
            }}
            onMouseEnter={handleHover}
            onMouseLeave={(e) => {
              if (window.innerWidth <= 768) return; // ❌ mobile pe hide mat karo

              const popup = (e.currentTarget as HTMLElement).querySelector(
                ".distributor-details",
              ) as HTMLElement;
              if (popup) {
                popup.classList.remove("show");
              }
            }}
          >
            {renderNode ? (
              renderNode(user)
            ) : (
              <div className={`distributor-wrap ${user.id && user.id !== "null" ? (user.paidstatus === "Paid" ? "paid" : "unpaid") : ""}`}>
                <div className="avatar">
                  <img
                    src={`${imageBaseUrl}ClientImages/${user.image}`}
                    alt="User"
                    onError={(e: any) => {
                      e.currentTarget.src = `${imageBaseUrl}employeedocuments/${user.image}`;
                    }}
                  />
                </div>
                <span className="name text_yellow" style={{ color: colorText }}>
                  {user.username}
                </span>
              </div>
            )}

            <div className="distributor-details">
              {renderDetail ? (
                renderDetail(user)
              ) : (
                <div className="details-wrap">
                  <div className="details-title">Member Details</div>

                  <div className="details-row">
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div className="label">Member Name</div>
                      <div className="value">{user.username}</div>
                    </div>
                  </div>

                  <div className="details-row">
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div className="label">Sponsor Name</div>
                      <div className="value">
                        {user.description?.Sponsor || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="details-row">
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div className="label">Joining Date</div>
                      <div className="value">
                        {user.description?.Reg_Date || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="details-row">
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div className="label">Status</div>
                      <div className="value">
                        {user.description?.Bot_Status || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="details-row">
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div className="label">Investment</div>
                      <div className="value">
                        Rs.
                        {user.description?.totalInvestmentAmount?.toFixed(2) ||
                          "0"}
                      </div>
                    </div>
                  </div>
                  <div className="details-row">
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div className="label">Activation Date</div>
                      <div className="value">
                        {user.description?.Bot_Activation_Date || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="details-title"></div>

                  <div
                    className="details-row border-top-2"
                    style={{
                      background: "none",
                      gap: "10",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">T-Left Business</div>
                      <div className="value">
                        {user.description?.totalleftTeamCount ?? 0}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">T-Right Business</div>
                      <div className="value">
                        {user.description?.totalRightTeamCount ?? 0}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">C-Left Business</div>
                      <div className="value">
                        {user.description?.leftTeamCount ?? 0}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">C-Right Business</div>
                      <div className="value">
                        {user.description?.rightTeamCount ?? 0}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">R-Left Business</div>
                      <div className="value">
                        {user.description?.leftRemainingTeamCount ?? 0}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">R-Right Business</div>
                      <div className="value">
                        {user.description?.rightRemaining ?? 0}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">Left Member Count</div>
                      <div className="value">
                        {user.description?.leftMemberCount ?? 0}
                      </div>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        background: "rgba(59, 59, 59, 0.68)",
                        width: "49%",
                        padding: "1px 4px",
                        marginBottom: "3px",
                      }}
                    >
                      <div className="label">Right Member Count</div>
                      <div className="value">
                        {user.description?.rightMemberCount ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="horizontal-line" />
              <div className="sloping-line" />
            </div>
          </a>
        )}

        {deep < maxDeep && (
          <ul>
            <BinaryTreeNode
              deep={deep + 1}
              maxDeep={maxDeep}
              allUsers={allUsers}
              user={leftChild}
              renderDetail={renderDetail}
              renderNode={renderNode}
              onClick={onClick}
              colorText={colorText}
              imageFake={imageFake}
              nameFake={nameFake}
            />
            <BinaryTreeNode
              deep={deep + 1}
              maxDeep={maxDeep}
              allUsers={allUsers}
              renderDetail={renderDetail}
              renderNode={renderNode}
              user={rightChild}
              onClick={onClick}
              colorText={colorText}
              imageFake={imageFake}
              nameFake={nameFake}
            />
          </ul>
        )}
      </li>
    );
  }
  componentDidMount() {
    document.addEventListener("click", (e) => {
      if (window.innerWidth > 768) return;

      const target = e.target as HTMLElement;

      if (!target.closest(".bt-node-wrap")) {
        document.querySelectorAll(".distributor-details").forEach((popup) => {
          popup.classList.remove("show");
        });
      }
    });
  }
}
