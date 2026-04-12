import { useEffect } from 'react'

function AddItemPanel({
  addItemId,
  addItemLoading,
  addItemMessage,
  addItemSearch,
  addQuantity,
  categories,
  categoryMap,
  filteredItemsForAdd,
  quickCreateItemLoading,
  quickNewItemCategoryId,
  quickNewItemName,
  quickNewItemRegular,
  showQuickCreateItem,
  onAddItem,
  onClose,
  onQuickCreateItem,
  onSetAddItemId,
  onSetAddItemMessage,
  onSetAddItemSearch,
  onSetAddQuantity,
  onSetQuickNewItemCategoryId,
  onSetQuickNewItemName,
  onSetQuickNewItemRegular,
  onToggleQuickCreateItem,
}) {
  useEffect(() => {
    if (filteredItemsForAdd.length === 0) {
      if (addItemId !== '') {
        onSetAddItemId('')
      }
      return
    }

    const hasValidSelection = filteredItemsForAdd.some(
      (item) => String(item.id) === String(addItemId)
    )

    if (!hasValidSelection) {
      onSetAddItemId(String(filteredItemsForAdd[0].id))
    }
  }, [filteredItemsForAdd, addItemId, onSetAddItemId])

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
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h2 style={{ margin: 0 }}>Add Item</h2>
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

      <form onSubmit={onAddItem}>
        <div style={{ marginBottom: '12px' }}>
          <label>Search items</label>
          <br />
          <input
            type="text"
            value={addItemSearch}
            onChange={(e) => onSetAddItemSearch(e.target.value)}
            placeholder="Search by item or category"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Select item</label>
          <br />
          <select
            value={addItemId}
            onChange={(e) => onSetAddItemId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          >
            {filteredItemsForAdd.length === 0 && <option value="">No matching items</option>}

            {filteredItemsForAdd.map((item) => {
              const categoryName =
                categoryMap.get(String(item.category_id))?.name || 'Uncategorized'

              return (
                <option key={item.id} value={item.id}>
                  {item.name} — {categoryName}
                </option>
              )
            })}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Quantity</label>
          <br />
          <input
            type="number"
            min="1"
            step="1"
            value={addQuantity}
            onChange={(e) => onSetAddQuantity(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <button
            type="submit"
            disabled={addItemLoading}
            style={{
              width: '100%',
              minHeight: '48px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            {addItemLoading ? 'Adding...' : 'Add to List'}
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleQuickCreateItem()
              onSetAddItemMessage(null)
            }}
            style={{
              width: '100%',
              minHeight: '48px',
              fontSize: '16px',
            }}
          >
            {showQuickCreateItem ? 'Cancel New Item' : 'Item Not In List'}
          </button>
        </div>
      </form>

      {showQuickCreateItem && (
        <div
          style={{
            borderTop: '1px solid #ddd',
            paddingTop: '16px',
            marginTop: '16px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create New Item</h3>

          <form onSubmit={onQuickCreateItem}>
            <div style={{ marginBottom: '12px' }}>
              <label>Item name</label>
              <br />
              <input
                type="text"
                value={quickNewItemName}
                onChange={(e) => onSetQuickNewItemName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Category</label>
              <br />
              <select
                value={quickNewItemCategoryId}
                onChange={(e) => onSetQuickNewItemCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={quickNewItemRegular}
                  onChange={(e) => onSetQuickNewItemRegular(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Mark as regular
              </label>
            </div>

            <button
              type="submit"
              disabled={quickCreateItemLoading}
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {quickCreateItemLoading ? 'Creating...' : 'Create Item'}
            </button>
          </form>
        </div>
      )}

      {addItemMessage && (
        <p
          style={{
            marginTop: '12px',
            color: addItemMessage.startsWith('Error') ? 'red' : '#333',
          }}
        >
          {addItemMessage}
        </p>
      )}
    </div>
  )
}

export default AddItemPanel
