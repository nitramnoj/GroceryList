function RegularsPanel({
  groupedRegularItems,
  message,
  addingRegulars,
  onAddSelected,
  onClose,
  onQuantityChange,
  onToggleItem,
}) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '20px' }}>Regulars</h2>
        <button
          onClick={onClose}
          style={{
            minHeight: '44px',
            padding: '0 12px',
            fontSize: '16px',
          }}
        >
          Close
        </button>
      </div>

      {message && (
        <p style={{ marginTop: 0, marginBottom: '12px' }}>
          {message}
        </p>
      )}

      {groupedRegularItems.length === 0 ? (
        <p style={{ margin: 0 }}>No regular items.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px' }}>
            {groupedRegularItems.map((group) => (
              <div key={group.key}>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px' }}>
                  {group.name}
                </h3>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {group.items.map((item) => {
                    const disabled = item.isAlreadyOnList

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '36px 1fr 80px',
                          gap: '12px',
                          alignItems: 'center',
                          padding: '14px',
                          border: '1px solid #e5e5e5',
                          borderRadius: '10px',
                          background: disabled ? '#f1f1f1' : '#fff',
                          opacity: disabled ? 0.55 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={disabled ? false : item.selected}
                          disabled={disabled}
                          onChange={(e) => onToggleItem(item.id, e.target.checked)}
                          style={{ width: '24px', height: '24px', margin: 0 }}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                        </div>

                        <input
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={item.quantity}
                          disabled={disabled}
                          onChange={(e) => onQuantityChange(item.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            fontSize: '16px',
                            minHeight: '44px',
                            boxSizing: 'border-box',
                            background: disabled ? '#e9e9e9' : '#fff',
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              onClick={onAddSelected}
              disabled={addingRegulars}
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {addingRegulars ? 'Adding...' : 'Add Selected'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default RegularsPanel
