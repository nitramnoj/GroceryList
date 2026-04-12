function CurrentList({ currentList, error, groupedList, listItems }) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '300px',
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        {currentList ? currentList.name : 'Current Shopping List'}
      </h2>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!error && !currentList && <p>No current list found.</p>}

      {!error && currentList && listItems.length === 0 && <p>No items in this list yet.</p>}

      {!error && groupedList.length > 0 && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {groupedList.map((group) => (
            <div key={group.key}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>
                {group.name}
              </h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {group.items.map((item) => {
                  const required = Number(item.quantity_required) || 0
                  const bought = Number(item.quantity_bought) || 0

                  const isComplete = bought >= required && required > 0
                  const isPartial = bought > 0 && bought < required

                  return (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '10px',
                        padding: '12px',
                        backgroundColor: isComplete ? '#f2f2f2' : '#fff',
                        opacity: isComplete ? 0.7 : 1,
                        display: 'grid',
                        gap: '4px',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: '16px',
                          textDecoration: isComplete ? 'line-through' : 'none',
                        }}
                      >
                        {item.items?.name}
                      </div>

                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {bought} / {required} bought
                        {isComplete && <span style={{ marginLeft: '6px' }}>✔</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CurrentList