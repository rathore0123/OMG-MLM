import React from "react";
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
  paidstatus: string;
  left_child_id?: string | number | null;
  right_child_id?: string | number | null;
  description?: UserDescription;
}

interface BinaryTreeNodeProps {
  user: User;
  allUsers: User[];
  deep: number;
  maxDeep?: number;
  renderDetail?: (user: User) => React.ReactNode;
  renderNode?: (user: User) => React.ReactNode;
  onClick?: (id: string | number) => void;
  colorText?: string;
  imageFake?: string;
  nameFake?: string;
  defaultAvatar?: string; // ── FIX: fallback image when a real image URL 404s/errors
}

// ── FIX: build a safe <img> src.
// - If `image` is already an absolute URL (http/https, e.g. the flaticon
//   DEFAULT_AVATAR or the PLUS_ICON server URL), use it directly.
// - Otherwise treat it as a filename living in /employeedocuments/ on the
//   image server, same convention the Member panel uses.
// - Previously this was `${imageBaseUrl}${user.image}` with no path segment,
//   AND it blindly prefixed imageBaseUrl even onto already-absolute URLs,
//   producing a broken concatenated URL (e.g. ".../uploads/employeedocumentshttps://cdn-icons...").
const buildImageSrc = (image: string | undefined, imageBaseUrl: string) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) {
    return image;
  }
  return `${imageBaseUrl}/employeedocuments/${image}`;
};

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
      colorText = "#333",
      imageFake = "",
      nameFake = "Blank",
      defaultAvatar = "",
    } = this.props;

    const fakeUser: User = {
      id: null,
      username: nameFake,
      paidstatus: null,
      left_child_id: null,
      right_child_id: null,
      image: imageFake,
    };

    let leftChild =
      allUsers.find((item) => item.id === user.left_child_id) || fakeUser;
    let rightChild =
      allUsers.find((item) => item.id === user.right_child_id) || fakeUser;
    const imageBaseUrl = import.meta.env.VITE_IMAGE_PREVIEW_URL;
    const imgSrc = buildImageSrc(user.image, imageBaseUrl);

    return (
      <li>
        {colorText && (
          <a
            onClick={() => {
              //alert(user.id)
              onClick && onClick(user.id);
            }}
            href="javascript:void(0)"
          >
            {renderNode ? (
              renderNode(user)
            ) : (
              <div className="distributor-wrap">
                <div
                  className={`avatar ${user.id ? (user.paidstatus === "Paid" ? "paid" : "unpaid") : ""}`}
                >
                  {/*
                    FIX: always render an <img> (image is guaranteed to be
                    either the real NodeImg, DEFAULT_AVATAR, or the plus
                    icon — never blank), and on error fall back to
                    defaultAvatar instead of hiding the element entirely.
                  */}
                  <img
                    src={imgSrc}
                    alt="User"
                    onError={(e: any) => {
                      if (defaultAvatar && e.target.src !== defaultAvatar) {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      } else {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }
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
                  {/* Header */}
                  <div className="details-title header">
                    Member Details
                    <span className="close-btn">×</span>
                  </div>

                  {/* Basic Info */}
                  <div className="details-row">
                    <span className="label">Member Name</span>
                    <span className="value">{user.username}</span>
                  </div>

                  <div className="details-row">
                    <span className="label">Sponsor Name</span>
                    <span className="value">
                      {user.description?.Sponsor || "-"}
                    </span>
                  </div>

                  <div className="details-row">
                    <span className="label">Joining Date</span>
                    <span className="value">
                      {user.description?.Reg_Date || "-"}
                    </span>
                  </div>

                  <div className="details-row">
                    <span className="label">Status</span>
                    <span
                      className={`status-badge ${user.description?.Bot_Status === "Active"
                        ? "active"
                        : "inactive"
                        }`}
                    >
                      {user.description?.Bot_Status || "-"}
                    </span>
                  </div>

                  <div className="details-row">
                    <span className="label">Investment</span>
                    <span className="value highlight">
                      $
                      {user.description?.totalInvestmentAmount?.toFixed(2) ||
                        "0"}
                    </span>
                  </div>

                  <div className="details-row">
                    <span className="label">Activation Date</span>
                    <span className="value">
                      {user.description?.Bot_Activation_Date || "-"}
                    </span>
                  </div>

                  <div className="business-grid">
                    <div className="business-box">
                      <span>Left Member Count</span>
                      <b>{user.description?.leftMemberCount ?? 0}</b>
                    </div>

                    <div className="business-box">
                      <span>Right Member Count</span>
                      <b>{user.description?.rightMemberCount ?? 0}</b>
                    </div>
                  </div>

                  <div className="business-grid">
                    <div className="business-box">
                      <span>Total Left Business</span>
                      <b>{user.description?.totalleftTeamCount ?? 0}</b>
                    </div>

                    <div className="business-box">
                      <span>Total Right Business</span>
                      <b>{user.description?.totalRightTeamCount ?? 0}</b>
                    </div>

                    <div className="business-box">
                      <span>Current Left Business</span>
                      <b>{user.description?.leftTeamCount ?? 0}</b>
                    </div>

                    <div className="business-box">
                      <span>Current Right Business</span>
                      <b>{user.description?.rightTeamCount ?? 0}</b>
                    </div>

                    <div className="business-box">
                      <span>Remaining Left Business</span>
                      <b>{user.description?.leftRemainingTeamCount ?? 0}</b>
                    </div>

                    <div className="business-box">
                      <span>Remaining Right Business</span>
                      <b>{user.description?.rightRemaining ?? 0}</b>
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
              defaultAvatar={defaultAvatar}
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
              defaultAvatar={defaultAvatar}
            />
          </ul>
        )}
      </li>
    );
  }
}