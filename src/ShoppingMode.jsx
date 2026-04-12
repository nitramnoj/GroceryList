function ShoppingMode({
  currentList,
  error,
  groupedList,
  message,
  updatingBoughtListItemId,
  onClose,
  onMarkComplete,
  onClearBought,
  onFinishShopping,
  finishingShopping,
}) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ margin: 0 }}>{currentList ? currentList.name : 'Shopping Mode'}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={onFinishShopping}
            disabled={finishingShopping}
            style={{
              minHeight: '48px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            {finishingShopping ? 'Saving...' : 'Finish Shopping'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={finishingShopping}
            style={{
              minHeight: '48px',
              fontSize: '16px',
            }}
          >
            Close
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!error && !currentList && <p>No current list found.</p>}

      {!error && currentList && groupedList.length === 0 && <p>No items in this list yet.</p>}

      {!error && groupedList.length > 0 && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {groupedList.map((group) => (
            <div key={group.key}>
              <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{group.name}</h3>

              <div style={{ display: 'grid', gap: '10px' }}>
                {group.items.map((item) => {
                  const quantityRequired = Number(item.quantity_required) || 0
                  const quantityBought = Number(item.quantity_bought) || 0
                  const isComplete = quantityBought >= quantityRequired && quantityRequired > 0
                  const isUpdating = updatingBoughtListItemId === item.id

                  return (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '10px',
                        backgroundColor: isComplete ? '#f2f2f2' : '#fff',
                        opacity: isComplete ? 0.7 : 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gap: '4px',
                            minWidth: 0,
                          }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {item.items?.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {quantityBought} / {quantityRequired} bought
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => onMarkComplete(item)}
                            disabled={isUpdating || isComplete || finishingShopping}
                            aria-label={`Mark ${item.items?.name || 'item'} as bought`}
                            title="Mark as bought"
                            style={{
                              minHeight: '48px',
                              fontSize: '16px',
                              fontWeight: '600',
                            }}
                          >
                            {isUpdating ? '...' : 'Bought'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onClearBought(item)}
                            disabled={isUpdating || quantityBought === 0 || finishingShopping}
                            style={{
                              minHeight: '48px',
                              fontSize: '16px',
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: '16px',
            color: message.startsWith('Error') ? 'red' : '#333',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default ShoppingMode
