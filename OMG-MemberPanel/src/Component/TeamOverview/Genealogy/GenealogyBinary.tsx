import React, { useState, useRef, useCallback } from 'react'
import './GenealogyBinary.scss'

// ─────────────────────────────────────────────
//  TYPES (unchanged — preserve all props)
// ─────────────────────────────────────────────
export interface MemberDetails {
  memberName: string
  memberId: string
  sponsorName: string
  sponsorId?: string
  joiningDate: string
  status: 'Active' | 'Inactive' | string
  investment: string
  activationDate?: string
  totalLeftBusiness?: number | string
  totalRightBusiness?: number | string
  currentLeftBusiness?: number | string
  currentRightBusiness?: number | string
  remainingLeftBusiness?: number | string
  remainingRightBusiness?: number | string
  avatar?: string
}

export interface TreeNodeData {
  id: string
  name: string
  memberId: string
  avatar?: string
  isBlank?: boolean
  details?: MemberDetails
  left?: TreeNodeData
  right?: TreeNodeData
}

export interface GenealogyBinaryProps {
  treeData?: TreeNodeData
  selectedMember?: MemberDetails
  onNodeClick?: (node: TreeNodeData) => void
  onBackToTop?: () => void
  onGoUp?: () => void
  onLeftCorner?: () => void
  onRightCorner?: () => void
  onAddBlank?: (node: TreeNodeData, side: 'left' | 'right') => void
  isLoading?: boolean
  theme?: 'dark' | 'light'
  className?: string
}

// ─────────────────────────────────────────────
//  INLINE ICONS
// ─────────────────────────────────────────────
const IcoHome = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IcoUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)
const IcoLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IcoRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IcoUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcoUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IcoCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IcoDollar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IcoShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IcoClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IcoPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

// ─────────────────────────────────────────────
//  HELPER — get initials
// ─────────────────────────────────────────────
const getInitials = (name: string): string =>
  name.split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase()

// ─────────────────────────────────────────────
//  HOVER TOOLTIP
//  Only renders when `visible` is true (state driven)
//  NOT driven by CSS :hover — avoids "always open" bug
// ─────────────────────────────────────────────
const HoverTooltip: React.FC<{ node: TreeNodeData; visible: boolean }> = ({ node, visible }) => {
  if (!visible || node.isBlank) return null
  const d = node.details

  const isActive = d?.status?.toLowerCase() === 'active'

  return (
    <div className="gbt-tooltip" role="tooltip" aria-live="polite">
      <div className="gbt-tooltip-arrow" />

      {/* Header */}
      <div className="gbt-tt-header">
        <div className="gbt-tt-avatar">
          {node.avatar
            ? <img src={node.avatar} alt={node.name} />
            : <span>{getInitials(node.name)}</span>}
        </div>
        <div className="gbt-tt-title">
          <p className="gbt-tt-name">{node.name}</p>
          <p className="gbt-tt-id">{node.memberId}</p>
        </div>
      </div>

      <div className="gbt-tt-divider" />

      {/* Status */}
      <div className="gbt-tt-status-row">
        <span className="gbt-tt-sec-label">STATUS</span>
        <span className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
          {d?.status ?? '—'}
        </span>
      </div>

      {d && (
        <>
          <div className="gbt-tt-divider" />
          <div className="gbt-tt-sec-label" style={{ padding: '8px 14px 4px' }}>MEMBER INFO</div>
          <div className="gbt-tt-grid">
            {d.sponsorName && (
              <div className="gbt-tt-row">
                <span className="gbt-tt-label">Sponsor</span>
                <span className="gbt-tt-val">{d.sponsorName}{d.sponsorId ? ` [${d.sponsorId}]` : ''}</span>
              </div>
            )}
            {d.joiningDate && (
              <div className="gbt-tt-row">
                <span className="gbt-tt-label">Joined</span>
                <span className="gbt-tt-val">{d.joiningDate}</span>
              </div>
            )}
            {d.activationDate && (
              <div className="gbt-tt-row">
                <span className="gbt-tt-label">Activated</span>
                <span className="gbt-tt-val">{d.activationDate}</span>
              </div>
            )}
            <div className="gbt-tt-row">
              <span className="gbt-tt-label">Investment</span>
              <span className="gbt-tt-val accent">{d.investment}</span>
            </div>
          </div>

          <div className="gbt-tt-divider" />
          <div className="gbt-tt-sec-label" style={{ padding: '8px 14px 6px' }}>TEAM BUSINESS</div>
          <div className="gbt-tt-biz">
            <div className="gbt-biz-cell"><span>TOTAL L</span><strong>{d.totalLeftBusiness ?? 0}</strong></div>
            <div className="gbt-biz-cell"><span>TOTAL R</span><strong>{d.totalRightBusiness ?? 0}</strong></div>
            <div className="gbt-biz-cell"><span>CURR L</span><strong>{d.currentLeftBusiness ?? 0}</strong></div>
            <div className="gbt-biz-cell"><span>CURR R</span><strong>{d.currentRightBusiness ?? 0}</strong></div>
            <div className="gbt-biz-cell"><span>REM L</span><strong>{d.remainingLeftBusiness ?? 0}</strong></div>
            <div className="gbt-biz-cell"><span>REM R</span><strong>{d.remainingRightBusiness ?? 0}</strong></div>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  SINGLE TREE NODE
// ─────────────────────────────────────────────
const TreeNode: React.FC<{
  node: TreeNodeData
  isRoot?: boolean
  onNodeClick?: (node: TreeNodeData) => void
  onAddBlank?: (node: TreeNodeData, side: 'left' | 'right') => void
  depth?: number
}> = ({ node, isRoot = false, onNodeClick, onAddBlank, depth = 0 }) => {
  const [hovered, setHovered] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onEnter = useCallback(() => {
    if (node.isBlank) return
    timer.current = setTimeout(() => setHovered(true), 100)
  }, [node.isBlank])

  const onLeave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setHovered(false)
  }, [])

  const handleClick = useCallback(() => {
    if (node.isBlank) {
      // handled by parent passing side
    } else {
      onNodeClick?.(node)
    }
  }, [node, onNodeClick])

  const hasLeft  = !!node.left
  const hasRight = !!node.right
  const hasChildren = hasLeft || hasRight

  return (
    <div className="gbt-col">

      {/* ── CARD ─────────────────────────────── */}
      <div className="gbt-card-outer">
        <div
          className={[
            'gbt-card',
            isRoot       ? 'gbt-card--root'   : '',
            node.isBlank ? 'gbt-card--blank'  : '',
            hovered      ? 'gbt-card--hovered': '',
          ].filter(Boolean).join(' ')}
          style={!node.isBlank && node.details ? (
            node.details.status?.toLowerCase() === 'active'
              ? { borderColor: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.22)' }
              : { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.20)' }
          ) : undefined}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') handleClick() }}
        >
          {/* Avatar / Plus icon */}
          {node.isBlank ? (
            <div className="gbt-blank-circle">
              <IcoPlus />
            </div>
          ) : (
            <div
              className={`gbt-avatar${isRoot ? ' gbt-avatar--root' : ''}`}
              style={node.details ? (
                node.details.status?.toLowerCase() === 'active'
                  ? { border: '3px solid #22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.18)' }
                  : { border: '3px solid #ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.18)' }
              ) : undefined}
            >
              {node.avatar
                ? <img src={node.avatar} alt={node.name} />
                : <span>{getInitials(node.name)}</span>}
            </div>
          )}

          <p
            className="gbt-node-name"
            style={!node.isBlank ? { background: '#6366f1', color: '#fff', borderRadius: '4px', padding: '2px 8px' } : undefined}
          >{node.isBlank ? 'Blank' : node.name}</p>
          {!node.isBlank && node.memberId && (
            <p className="gbt-node-id">{node.memberId}</p>
          )}
        </div>

        {/* Tooltip — state controlled, not CSS :hover */}
        <HoverTooltip node={node} visible={hovered} />
      </div>

      {/* ── CHILDREN ─────────────────────────── */}
      {hasChildren && (
        <div className="gbt-subtree">
          {/* Vertical stem down from parent */}
          <div className="gbt-stem" />

          {/* Horizontal connector bar */}
          <div className="gbt-hbar-wrap">
            <div className="gbt-hbar" />
          </div>

          {/* Children row */}
          <div className="gbt-children">
            {hasLeft && (
              <div className="gbt-branch">
                <div className="gbt-vstem" />
                <TreeNode
                  node={node.left!}
                  onNodeClick={onNodeClick}
                  onAddBlank={node.left!.isBlank
                    ? () => onAddBlank?.(node, 'left')
                    : onAddBlank}
                  depth={depth + 1}
                />
              </div>
            )}
            {hasRight && (
              <div className="gbt-branch">
                <div className="gbt-vstem" />
                <TreeNode
                  node={node.right!}
                  onNodeClick={onNodeClick}
                  onAddBlank={node.right!.isBlank
                    ? () => onAddBlank?.(node, 'right')
                    : onAddBlank}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  RIGHT SIDEBAR
// ─────────────────────────────────────────────
const MemberSidebar: React.FC<{ member?: MemberDetails }> = ({ member }) => (
  <aside className="gbt-sidebar">
    <div className="gbt-sb-header">
      <span className="gbt-sb-icon"><IcoUser /></span>
      <span className="gbt-sb-title">MEMBER DETAILS</span>
    </div>

    {!member ? (
      <div className="gbt-sb-empty">Click a node to view details</div>
    ) : (
      <>
        <div className="gbt-sb-rows">
          {(
            [
              { icon: <IcoUser />,     label: 'Member Name',   val: `${member.memberName}${member.memberId ? ` [${member.memberId}]` : ''}` },
              { icon: <IcoUsers />,    label: 'Sponsor Name',  val: `${member.sponsorName}${member.sponsorId ? ` [${member.sponsorId}]` : ''}` },
              { icon: <IcoCalendar />, label: 'Joining Date',  val: member.joiningDate },
              { icon: <IcoShield />,   label: 'Status',        val: member.status, isStatus: true },
              { icon: <IcoDollar />,   label: 'Investment',    val: member.investment },
              ...(member.activationDate
                ? [{ icon: <IcoClock />, label: 'Activation Date', val: member.activationDate }]
                : []),
            ] as Array<{ icon: React.ReactNode; label: string; val: string; isStatus?: boolean }>
          ).map((row, i) => (
            <div key={i} className="gbt-sb-row">
              <div className="gbt-sb-row-left">
                <span className="gbt-sb-row-icon">{row.icon}</span>
                <span className="gbt-sb-row-label">{row.label}</span>
              </div>
              {row.isStatus ? (
                <span className={`status-pill ${member.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                  {member.status}
                </span>
              ) : (
                <span className="gbt-sb-row-val">{row.val}</span>
              )}
            </div>
          ))}
        </div>

        <div className="gbt-sb-biz">
          {[
            ['Total Left Business',      member.totalLeftBusiness     ?? 0],
            ['Total Right Business',     member.totalRightBusiness    ?? 0],
            ['Current Left Business',    member.currentLeftBusiness   ?? 0],
            ['Current Right Business',   member.currentRightBusiness  ?? 0],
            ['Remaining Left Business',  member.remainingLeftBusiness ?? 0],
            ['Remaining Right Business', member.remainingRightBusiness ?? 0],
          ].map(([label, val], i) => (
            <div key={i} className="gbt-biz-stat">
              <span className="gbt-biz-stat-label">{label}</span>
              <span className="gbt-biz-stat-val">{val}</span>
            </div>
          ))}
        </div>
      </>
    )}
  </aside>
)

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const GenealogyBinary: React.FC<GenealogyBinaryProps> = ({
  treeData,
  selectedMember,
  onNodeClick,
  onBackToTop,
  onGoUp,
  onLeftCorner,
  onRightCorner,
  onAddBlank,
  isLoading = false,
  theme = 'dark',
  className = '',
}) => (
  <div className={`gbt-root ${theme} ${className}`}>

    {/* PAGE HEADER */}
    <div className="gbt-page-header">
      <nav className="gbt-breadcrumb">
        <span className="bc-seg">Network</span>
        <span className="bc-div">/</span>
        <span className="bc-seg bc-active">Binary Tree</span>
      </nav>
      <h1 className="gbt-page-title">Genealogy Tree</h1>
    </div>

    {/* NAV CONTROLS */}
    <div className="gbt-controls">
      {[
        { icon: <IcoHome />,  label: 'Back to Top',  fn: onBackToTop  },
        { icon: <IcoUp />,   label: 'Go Up',         fn: onGoUp       },
        { icon: <IcoLeft />, label: 'Left Corner',   fn: onLeftCorner  },
        { icon: <IcoRight />,label: 'Right Corner',  fn: onRightCorner },
      ].map(({ icon, label, fn }) => (
        <button key={label} className="gbt-ctrl-btn" onClick={fn} type="button">
          {icon}<span>{label}</span>
        </button>
      ))}
    </div>

    {/* BODY */}
    <div className="gbt-body">
      {/* Scrollable tree canvas */}
      <div className="gbt-canvas-wrap">
        {isLoading ? (
          <div className="gbt-loader"><div className="gbt-spinner" /></div>
        ) : treeData ? (
          <div className="gbt-canvas">
            <TreeNode
              node={treeData}
              isRoot
              onNodeClick={onNodeClick}
              onAddBlank={onAddBlank}
            />
          </div>
        ) : (
          <div className="gbt-empty">No tree data available.</div>
        )}
      </div>

      {/* Sidebar */}
      <MemberSidebar member={selectedMember} />
    </div>

  </div>
)

export default GenealogyBinary
