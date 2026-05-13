/* StatusPill — maps all job state machine statuses (v1.1) to coloured pills */

/*
 * Each entry has the token colour for text and a matching light tint for background.
 * Background values are the status colour at ~15% opacity on white.
 */
const STATUS_MAP = {
  // v1.1 statuses
  POSTED:           { label: 'Posted',           text: '#9AA5B4', bg: '#F5F7FA' },
  NEGOTIATING:      { label: 'Negotiating',      text: '#E67E22', bg: '#FEF5EC' },
  AGREED:           { label: 'Agreed',           text: '#F39C12', bg: '#FEF9E7' },
  ESCROW_HELD:      { label: 'Escrow Held',      text: '#3498DB', bg: '#EBF5FB' },
  IN_PROGRESS:      { label: 'In Progress',      text: '#9B59B6', bg: '#F5EEF8' },
  PENDING_APPROVAL: { label: 'Pending Approval', text: '#27AE60', bg: '#EAFAF1' },
  INCOMPLETE:       { label: 'Incomplete',       text: '#F39C12', bg: '#FEF9E7' },
  DISPUTED:         { label: 'Disputed',         text: '#E74C3C', bg: '#FDEDEC' },
  RELEASED:         { label: 'Released',         text: '#27AE60', bg: '#EAFAF1' },
  REFUNDED:         { label: 'Refunded',         text: '#E67E22', bg: '#FEF5EC' },
  SETTLED:          { label: 'Settled',          text: '#27AE60', bg: '#EAFAF1' },
  CANCELLED:        { label: 'Cancelled',        text: '#95A5A6', bg: '#F5F7FA' },
  // v1.0 aliases (kept for any admin views not yet migrated)
  REQUESTED:        { label: 'Posted',           text: '#9AA5B4', bg: '#F5F7FA' },
  PENDING_DEPOSIT:  { label: 'Awaiting Payment', text: '#F39C12', bg: '#FEF9E7' },
  CONFIRMED:        { label: 'Confirmed',        text: '#3498DB', bg: '#EBF5FB' },
  COMPLETE:         { label: 'Complete',         text: '#27AE60', bg: '#EAFAF1' },
}

/**
 * StatusPill — displays a job status as a coloured pill badge.
 *
 * @param {string} status          One of the 11 job state machine statuses
 * @param {Object} [labelOverrides] Optional map of status → display label, e.g.
 *                                  { RELEASED: 'Completed & Paid' } for worker views
 */
export default function StatusPill({ status, labelOverrides }) {
  const base = STATUS_MAP[status] ?? { label: status, text: '#95A5A6', bg: '#F5F7FA' }
  const { text, bg } = base
  const label = (labelOverrides && labelOverrides[status]) ?? base.label

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 15px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      whiteSpace: 'nowrap',
      background: bg,
      color: text,
    }}>
      {label}
    </span>
  )
}
