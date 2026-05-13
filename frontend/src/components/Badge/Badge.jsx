/* Badge — inline label chip, all styles inline via design tokens */

const VARIANTS = {
  default: { bg: 'var(--color-gray-200)',        color: 'var(--color-gray-600)'       },
  primary: { bg: 'var(--color-primary-light)',   color: 'var(--color-primary-dark)'   },
  success: { bg: 'var(--color-success-bg)',      color: 'var(--color-success)'        },
  warning: { bg: 'var(--color-warning-bg)',      color: 'var(--color-warning)'        },
  error:   { bg: 'var(--color-error-bg)',        color: 'var(--color-error)'          },
}

/**
 * Badge — small inline label chip.
 *
 * @param {string} variant  'default' | 'primary' | 'success' | 'warning' | 'error'
 * @param {node}   children
 */
export default function Badge({ variant = 'default', children }) {
  const { bg, color } = VARIANTS[variant] ?? VARIANTS.default

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)',
      letterSpacing: '0.3px',
      background: bg,
      color,
    }}>
      {children}
    </span>
  )
}
