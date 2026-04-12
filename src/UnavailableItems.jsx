function UnavailableItems({
  unavailableItems,
  loading,
  message,
  addingUnavailableItemId,
  onClose,
  onAddToCurrentList,
  onRemoveItem,
}) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '300px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ margin: 0 }}>Unavailable Items</h2>
        <button
          type="button"
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

      {loading && <p>Loading unavailable items...</p>}

      {!loading && unavailableItems.length === 0 && <p>No unavailable items.</p>}

      {!loading && unavailableItems.length > 0 && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {unavailableItems.map((item) => {
            const isAdding = addingUnavailableItemId === item.id

            return (
              <div
                key={item.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {item.items?.name} x{item.quantity}
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
                    onClick={() => onAddToCurrentList(item)}
                    disabled={isAdding}
                    style={{
                      minHeight: '48px',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}
                  >
                    {isAdding ? 'Adding...' : 'Add'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item)}
                    disabled={isAdding}
                    style={{
                      minHeight: '48px',
                      fontSize: '16px',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
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

export default UnavailableItems