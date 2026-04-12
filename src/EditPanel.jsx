function EditPanel({
  allItems,
  categories,
  createItemLoading,
  deletingCategoryId,
  deletingItemId,
  editMessage,
  editSection,
  listItems,
  newCategoryName,
  newCategorySortOrder,
  newItemCategoryId,
  newItemName,
  newItemRegular,
  removingListItemId,
  savingCategoryId,
  savingItemId,
  savingListItemId,
  selectedEditListItem,
  selectedEditListItemId,
  selectedEditSavedItem,
  selectedEditSavedItemId,
  showCreateItem,
  sortedItemsForAdd,
  onCategoryDraftChange,
  onClose,
  onCreateCategory,
  onCreateNewItem,
  onDeleteCategory,
  onDeleteItem,
  onItemDraftChange,
  onListItemDraftChange,
  onOpenSection,
  onRemoveListItem,
  onSaveCategory,
  onSaveItem,
  onSaveListItemQuantity,
  onSetNewCategoryName,
  onSetNewCategorySortOrder,
  onSetNewItemCategoryId,
  onSetNewItemName,
  onSetNewItemRegular,
  onSetSelectedEditListItemId,
  onSetSelectedEditSavedItemId,
  onToggleShowCreateItem,
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
        <h2 style={{ margin: 0 }}>Edit</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <button type="button" onClick={() => onOpenSection('currentList')}>
          Current List
        </button>
        <button type="button" onClick={() => onOpenSection('items')}>
          Items
        </button>
        <button type="button" onClick={() => onOpenSection('categories')}>
          Categories
        </button>
      </div>

      {editSection === 'currentList' && (
        <div>
          <h3 style={{ marginTop: 0 }}>Edit Current List</h3>

          {listItems.length === 0 && <p>No items in the current list.</p>}

          {listItems.length > 0 && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label>Select list item</label>
                <br />
                <select
                  value={selectedEditListItemId}
                  onChange={(e) => onSetSelectedEditListItemId(e.target.value)}
                  style={{ width: '100%', maxWidth: '400px' }}
                >
                  {listItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.items?.name} x{item.quantity_required}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEditListItem && (
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#fff',
                  }}
                >
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                    {selectedEditListItem.items?.name}
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    Current quantity: {selectedEditListItem.quantity_required}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label>Quantity</label>
                    <br />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={selectedEditListItem.draftQuantity}
                      onChange={(e) =>
                        onListItemDraftChange(selectedEditListItem.id, e.target.value)
                      }
                      style={{ width: '120px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onSaveListItemQuantity(selectedEditListItem)}
                      disabled={savingListItemId === selectedEditListItem.id}
                    >
                      {savingListItemId === selectedEditListItem.id ? 'Saving...' : 'Save Quantity'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveListItem(selectedEditListItem)}
                      disabled={removingListItemId === selectedEditListItem.id}
                    >
                      {removingListItemId === selectedEditListItem.id
                        ? 'Removing...'
                        : 'Remove from List'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {editSection === 'items' && (
        <div>
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
            <h3 style={{ margin: 0 }}>Manage Items</h3>
            <button type="button" onClick={onToggleShowCreateItem}>
              {showCreateItem ? 'Cancel New Item' : 'Create New Item'}
            </button>
          </div>

          {showCreateItem && (
            <form
              onSubmit={onCreateNewItem}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <label>Item name</label>
                <br />
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => onSetNewItemName(e.target.value)}
                  style={{ width: '100%', maxWidth: '400px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label>Category</label>
                <br />
                <select
                  value={newItemCategoryId}
                  onChange={(e) => onSetNewItemCategoryId(e.target.value)}
                  style={{ width: '100%', maxWidth: '400px' }}
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
                    checked={newItemRegular}
                    onChange={(e) => onSetNewItemRegular(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Mark as regular
                </label>
              </div>

              <button type="submit" disabled={createItemLoading}>
                {createItemLoading ? 'Creating...' : 'Create Item'}
              </button>
            </form>
          )}

          {allItems.length === 0 && <p>No saved items found.</p>}

          {allItems.length > 0 && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label>Select item</label>
                <br />
                <select
                  value={selectedEditSavedItemId}
                  onChange={(e) => onSetSelectedEditSavedItemId(e.target.value)}
                  style={{ width: '100%', maxWidth: '400px' }}
                >
                  {sortedItemsForAdd.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.draftName || item.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEditSavedItem && (
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#fff',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <label>Name</label>
                    <br />
                    <input
                      type="text"
                      value={selectedEditSavedItem.draftName}
                      onChange={(e) =>
                        onItemDraftChange(selectedEditSavedItem.id, 'draftName', e.target.value)
                      }
                      style={{ width: '100%', maxWidth: '400px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label>Category</label>
                    <br />
                    <select
                      value={selectedEditSavedItem.draftCategoryId}
                      onChange={(e) =>
                        onItemDraftChange(selectedEditSavedItem.id, 'draftCategoryId', e.target.value)
                      }
                      style={{ width: '100%', maxWidth: '400px' }}
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
                        checked={selectedEditSavedItem.draftRegular}
                        onChange={(e) =>
                          onItemDraftChange(selectedEditSavedItem.id, 'draftRegular', e.target.checked)
                        }
                        style={{ marginRight: '8px' }}
                      />
                      Mark as regular
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onSaveItem(selectedEditSavedItem)}
                      disabled={savingItemId === selectedEditSavedItem.id}
                    >
                      {savingItemId === selectedEditSavedItem.id ? 'Saving...' : 'Save Item'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteItem(selectedEditSavedItem)}
                      disabled={deletingItemId === selectedEditSavedItem.id}
                    >
                      {deletingItemId === selectedEditSavedItem.id ? 'Deleting...' : 'Delete Item'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {editSection === 'categories' && (
        <div>
          <h3 style={{ marginTop: 0 }}>Manage Categories</h3>

          <form
            onSubmit={onCreateCategory}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <label>Category name</label>
              <br />
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => onSetNewCategoryName(e.target.value)}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Sort order</label>
              <br />
              <input
                type="number"
                step="1"
                value={newCategorySortOrder}
                onChange={(e) => onSetNewCategorySortOrder(e.target.value)}
                style={{ width: '140px' }}
              />
            </div>

            <button type="submit">Create Category</button>
          </form>

          {categories.length === 0 && <p>No categories found.</p>}

          {categories.length > 0 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#fff',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <label>Name</label>
                    <br />
                    <input
                      type="text"
                      value={category.draftName}
                      onChange={(e) =>
                        onCategoryDraftChange(category.id, 'draftName', e.target.value)
                      }
                      style={{ width: '100%', maxWidth: '400px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label>Sort order</label>
                    <br />
                    <input
                      type="number"
                      step="1"
                      value={category.draftSortOrder}
                      onChange={(e) =>
                        onCategoryDraftChange(category.id, 'draftSortOrder', e.target.value)
                      }
                      style={{ width: '140px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onSaveCategory(category)}
                      disabled={savingCategoryId === category.id}
                    >
                      {savingCategoryId === category.id ? 'Saving...' : 'Save'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCategory(category)}
                      disabled={deletingCategoryId === category.id}
                    >
                      {deletingCategoryId === category.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editMessage && (
        <p
          style={{
            marginTop: '16px',
            color: editMessage.startsWith('Error') ? 'red' : '#333',
          }}
        >
          {editMessage}
        </p>
      )}
    </div>
  )
}

export default EditPanel
