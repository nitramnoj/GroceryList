import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import ShoppingMode from './ShoppingMode'
import AddItemPanel from './AddItemPanel'
import EditPanel from './EditPanel'
import UnavailableItems from './UnavailableItems'
import CurrentList from './CurrentList'
import RegularsPanel from './RegularsPanel'

const OFFLINE_QUEUE_KEY = 'offlineQueue'

function addToOfflineQueue(action) {
  const existing = localStorage.getItem(OFFLINE_QUEUE_KEY)
  const queue = existing ? JSON.parse(existing) : []

  queue.push({
    ...action,
    id: Date.now(),
  })

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

function App() {
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)
  const [currentList, setCurrentList] = useState(null)
  const [listItems, setListItems] = useState([])

  const [categories, setCategories] = useState([])
  const [allItems, setAllItems] = useState([])

  const [showAddItem, setShowAddItem] = useState(false)
  const [addItemSearch, setAddItemSearch] = useState('')
  const [addItemId, setAddItemId] = useState('')
  const [addQuantity, setAddQuantity] = useState('1')
  const [addItemMessage, setAddItemMessage] = useState(null)
  const [addItemLoading, setAddItemLoading] = useState(false)

  const [showQuickCreateItem, setShowQuickCreateItem] = useState(false)
  const [quickNewItemName, setQuickNewItemName] = useState('')
  const [quickNewItemCategoryId, setQuickNewItemCategoryId] = useState('')
  const [quickNewItemRegular, setQuickNewItemRegular] = useState(false)
  const [quickCreateItemLoading, setQuickCreateItemLoading] = useState(false)

  const [showEditPanel, setShowEditPanel] = useState(false)
  const [editSection, setEditSection] = useState('currentList')
  const [editMessage, setEditMessage] = useState(null)
  const [selectedEditListItemId, setSelectedEditListItemId] = useState('')
  const [selectedEditSavedItemId, setSelectedEditSavedItemId] = useState('')

  const [showCreateItem, setShowCreateItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategoryId, setNewItemCategoryId] = useState('')
  const [newItemRegular, setNewItemRegular] = useState(false)
  const [createItemLoading, setCreateItemLoading] = useState(false)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySortOrder, setNewCategorySortOrder] = useState('')
  const [savingCategoryId, setSavingCategoryId] = useState(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)

  const [savingListItemId, setSavingListItemId] = useState(null)
  const [removingListItemId, setRemovingListItemId] = useState(null)

  const [savingItemId, setSavingItemId] = useState(null)
  const [deletingItemId, setDeletingItemId] = useState(null)

  const [showShoppingMode, setShowShoppingMode] = useState(false)
  const [shoppingModeMessage, setShoppingModeMessage] = useState(null)
  const [updatingBoughtListItemId, setUpdatingBoughtListItemId] = useState(null)
  const [finishingShopping, setFinishingShopping] = useState(false)
  const [showUnavailableItems, setShowUnavailableItems] = useState(false)
  const [unavailableItems, setUnavailableItems] = useState([])
  const [unavailableItemsMessage, setUnavailableItemsMessage] = useState(null)
  const [unavailableItemsLoading, setUnavailableItemsLoading] = useState(false)
  const [addingUnavailableItemId, setAddingUnavailableItemId] = useState(null)

  const [showRegulars, setShowRegulars] = useState(false)
  const [regularSelections, setRegularSelections] = useState({})
  const [regularsMessage, setRegularsMessage] = useState(null)
  const [addingRegulars, setAddingRegulars] = useState(false)

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadCurrentList()
      loadCategories()
      loadAllItems()
    }
  }, [session])

  useEffect(() => {
    if (listItems.length === 0) {
      setSelectedEditListItemId('')
      return
    }

    const stillExists = listItems.some(
      (item) => String(item.id) === String(selectedEditListItemId)
    )

    if (!stillExists) {
      setSelectedEditListItemId(String(listItems[0].id))
    }
  }, [listItems, selectedEditListItemId])

  useEffect(() => {
    if (allItems.length === 0) {
      setSelectedEditSavedItemId('')
      return
    }

    const stillExists = allItems.some(
      (item) => String(item.id) === String(selectedEditSavedItemId)
    )

    if (!stillExists) {
      const firstSortedItem = [...allItems].sort((a, b) => a.name.localeCompare(b.name))[0]
      setSelectedEditSavedItemId(firstSortedItem ? String(firstSortedItem.id) : '')
    }
  }, [allItems, selectedEditSavedItemId])


  useEffect(() => {
    const regularItems = allItems.filter((item) => item.regular)

    if (regularItems.length === 0) {
      setRegularSelections({})
      return
    }

    const currentListItemIds = new Set(listItems.map((item) => String(item.item_id)))

    setRegularSelections((prev) => {
      const next = {}

      regularItems.forEach((item) => {
        const key = String(item.id)
        const existing = prev[key]
        const isAlreadyOnList = currentListItemIds.has(key)
        const defaultQuantity =
          item.default_quantity === null || item.default_quantity === undefined
            ? '1'
            : String(item.default_quantity)

        next[key] = {
          selected: isAlreadyOnList ? false : existing?.selected ?? false,
          quantity: existing?.quantity ?? defaultQuantity,
        }
      })

      return next
    })
  }, [allItems, listItems])

  async function loadCurrentList() {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('is_current', true)
      .maybeSingle()

    if (error) {
      const cached = localStorage.getItem('currentList')

      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setCurrentList(parsed)
          setError('Offline mode: showing last saved list.')
          if (parsed?.id) {
            await loadListItems(parsed.id)
          }
          return
        } catch {
          // ignore parse errors
        }
      }

      setError(`Error loading current list: ${error.message}`)
      return
    }

    setCurrentList(data)
    localStorage.setItem('currentList', JSON.stringify(data))
    setError(null)

    if (data) {
      await loadListItems(data.id)
    } else {
      setListItems([])
    }
  }

  async function loadListItems(shoppingListId) {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select(`
        id,
        item_id,
        quantity_required,
        quantity_bought,
        note,
        unavailable,
        items (
          id,
          name,
          category_id
        )
      `)
      .eq('shopping_list_id', shoppingListId)
      .order('id', { ascending: true })

    if (error) {
      const cached = localStorage.getItem('listItems')

      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setListItems(parsed)
          setError('Offline mode: showing last saved list.')
          return
        } catch {
          // ignore parse errors
        }
      }

      setError(`Error loading list items: ${error.message}`)
      return
    }

    const processedItems =
      (data || []).map((item) => ({
        ...item,
        draftQuantity:
          item.quantity_required === null || item.quantity_required === undefined
            ? ''
            : String(item.quantity_required),
      }))

    setListItems(processedItems)
    localStorage.setItem('listItems', JSON.stringify(processedItems))
    setError(null)
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        sort_order
      `)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      const cached = localStorage.getItem('categories')

      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setCategories(parsed)
          setEditMessage('Offline mode: showing last saved categories.')
          return
        } catch {
          // ignore parse errors
        }
      }

      setEditMessage(`Error loading categories: ${error.message}`)
      return
    }

    const processedCategories =
      (data || []).map((category) => ({
        ...category,
        draftName: category.name ?? '',
        draftSortOrder:
          category.sort_order === null || category.sort_order === undefined
            ? ''
            : String(category.sort_order),
      }))

    setCategories(processedCategories)
    localStorage.setItem('categories', JSON.stringify(processedCategories))
  }

  async function loadAllItems() {
    const { data, error } = await supabase
      .from('items')
      .select(`
        id,
        name,
        category_id,
        regular,
        default_quantity,
        default_note
      `)

    if (error) {
      const cached = localStorage.getItem('allItems')

      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setAllItems(parsed)
          setEditMessage('Offline mode: showing last saved items.')
          return
        } catch {
          // ignore parse errors
        }
      }

      setEditMessage(`Error loading items: ${error.message}`)
      return
    }

    const processedItems =
      (data || []).map((item) => ({
        ...item,
        draftName: item.name ?? '',
        draftCategoryId:
          item.category_id === null || item.category_id === undefined
            ? ''
            : String(item.category_id),
        draftRegular: !!item.regular,
      }))

    setAllItems(processedItems)
    localStorage.setItem('allItems', JSON.stringify(processedItems))
  }

  async function refreshReferenceData() {
    await loadCategories()
    await loadAllItems()
  }

  async function loadUnavailableItems() {
    setUnavailableItemsLoading(true)

    const { data, error } = await supabase
      .from('unavailable_items')
      .select(`
        id,
        item_id,
        quantity,
        created_at,
        items (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    setUnavailableItemsLoading(false)

    if (error) {
      setUnavailableItemsMessage(`Error loading unavailable items: ${error.message}`)
      return
    }

    setUnavailableItems(data || [])
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(`Login failed: ${error.message}`)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()

    setCurrentList(null)
    setListItems([])
    setCategories([])
    setAllItems([])

    setShowAddItem(false)
    setAddItemSearch('')
    setAddItemId('')
    setAddQuantity('1')
    setAddItemMessage(null)
    setAddItemLoading(false)

    setShowQuickCreateItem(false)
    setQuickNewItemName('')
    setQuickNewItemCategoryId('')
    setQuickNewItemRegular(false)
    setQuickCreateItemLoading(false)

    setShowEditPanel(false)
    setEditSection('currentList')
    setEditMessage(null)
    setSelectedEditListItemId('')
    setSelectedEditSavedItemId('')

    setShowCreateItem(false)
    setNewItemName('')
    setNewItemCategoryId('')
    setNewItemRegular(false)
    setCreateItemLoading(false)

    setNewCategoryName('')
    setNewCategorySortOrder('')
    setSavingCategoryId(null)
    setDeletingCategoryId(null)

    setSavingListItemId(null)
    setRemovingListItemId(null)

    setSavingItemId(null)
    setDeletingItemId(null)

    setShowShoppingMode(false)
    setShoppingModeMessage(null)
    setUpdatingBoughtListItemId(null)
    setFinishingShopping(false)

    setShowUnavailableItems(false)
    setUnavailableItems([])
    setUnavailableItemsMessage(null)
    setUnavailableItemsLoading(false)
    setAddingUnavailableItemId(null)

    setShowRegulars(false)
    setRegularSelections({})
    setRegularsMessage(null)
    setAddingRegulars(false)
  }

  async function handleOpenAddItem() {
    setShowShoppingMode(false)
    setShowUnavailableItems(false)
    setShowEditPanel(false)
    setShowRegulars(false)
    setShowAddItem(true)

    setAddItemMessage(null)
    setEditMessage(null)
    setRegularsMessage(null)
    setAddItemSearch('')
    setAddItemId('')
    setAddQuantity('1')
    setShowQuickCreateItem(false)
    setQuickNewItemName('')
    setQuickNewItemCategoryId('')
    setQuickNewItemRegular(false)

    if (categories.length === 0 || allItems.length === 0) {
      await refreshReferenceData()
    }
  }

  function handleCloseAddItem() {
    setShowAddItem(false)
    setAddItemSearch('')
    setAddItemId('')
    setAddQuantity('1')
    setAddItemMessage(null)
    setShowQuickCreateItem(false)
    setQuickNewItemName('')
    setQuickNewItemCategoryId('')
    setQuickNewItemRegular(false)
  }

  async function handleOpenEditPanel(section = 'currentList') {
    setShowShoppingMode(false)
    setShowUnavailableItems(false)
    setShowAddItem(false)
    setShowRegulars(false)
    setShowEditPanel(true)

    setEditSection(section)
    setEditMessage(null)
    setAddItemMessage(null)
    setRegularsMessage(null)
    setShowCreateItem(false)

    if (section === 'currentList' && currentList) {
      await loadListItems(currentList.id)
    }

    if (section === 'items' || section === 'categories') {
      await refreshReferenceData()
    }
  }

  function handleCloseEditPanel() {
    setShowEditPanel(false)
    setEditMessage(null)
    setShowCreateItem(false)
  }

  async function handleOpenShoppingMode() {
    setShowShoppingMode(true)
    setShowUnavailableItems(false)
    setShowAddItem(false)
    setShowEditPanel(false)
    setShowRegulars(false)

    setAddItemMessage(null)
    setEditMessage(null)
    setRegularsMessage(null)
    setShoppingModeMessage(null)

    if (currentList) {
      await loadListItems(currentList.id)
    }
  }

  function handleCloseShoppingMode() {
    setShowShoppingMode(false)
    setShoppingModeMessage(null)
  }

  async function handleOpenUnavailableItems() {
    setShowUnavailableItems(true)
    setShowShoppingMode(false)
    setShowAddItem(false)
    setShowEditPanel(false)
    setShowRegulars(false)

    setAddItemMessage(null)
    setEditMessage(null)
    setRegularsMessage(null)
    setUnavailableItemsMessage(null)
    await loadUnavailableItems()
  }

  function handleCloseUnavailableItems() {
    setShowUnavailableItems(false)
    setUnavailableItemsMessage(null)
  }

  async function handleOpenRegulars() {
    setShowRegulars(true)
    setShowShoppingMode(false)
    setShowUnavailableItems(false)
    setShowAddItem(false)
    setShowEditPanel(false)

    setAddItemMessage(null)
    setEditMessage(null)
    setShoppingModeMessage(null)
    setRegularsMessage(null)

    if (categories.length === 0 || allItems.length === 0) {
      await refreshReferenceData()
    }

    if (currentList) {
      await loadListItems(currentList.id)
    }
  }

  function handleCloseRegulars() {
    setShowRegulars(false)
    setRegularsMessage(null)
  }

  function handleRegularSelectionChange(itemId, checked) {
    setRegularSelections((prev) => ({
      ...prev,
      [String(itemId)]: {
        selected: checked,
        quantity: prev[String(itemId)]?.quantity ?? '1',
      },
    }))
  }

  function handleRegularQuantityChange(itemId, value) {
    setRegularSelections((prev) => ({
      ...prev,
      [String(itemId)]: {
        selected: prev[String(itemId)]?.selected ?? false,
        quantity: value,
      },
    }))
  }

  async function handleAddSelectedRegulars() {
    if (!currentList) {
      setRegularsMessage('No current shopping list found.')
      return
    }

    const currentListItemIds = new Set(listItems.map((item) => String(item.item_id)))

    const selectedRegularItems = sortedItemsForAdd.filter((item) => {
      const selection = regularSelections[String(item.id)]
      return item.regular && !currentListItemIds.has(String(item.id)) && selection?.selected
    })

    if (selectedRegularItems.length === 0) {
      setRegularsMessage('No regular items selected.')
      return
    }

    const rows = []

    for (const item of selectedRegularItems) {
      const selection = regularSelections[String(item.id)]
      const quantityNumber = Number(selection?.quantity)

      if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
        setRegularsMessage(`Enter a valid quantity for "${item.name}".`)
        return
      }

      rows.push({
        shopping_list_id: currentList.id,
        item_id: Number(item.id),
        quantity_required: quantityNumber,
        quantity_bought: 0,
        note: null,
        unavailable: false,
      })
    }

    setAddingRegulars(true)
    setRegularsMessage(null)

    const { error } = await supabase.from('shopping_list_items').insert(rows)

    setAddingRegulars(false)

    if (error) {
      setRegularsMessage(`Error adding regular items: ${error.message}`)
      return
    }

    await loadListItems(currentList.id)
    setRegularsMessage(
      `${rows.length} regular item${rows.length === 1 ? '' : 's'} added to the list.`
    )
  }

  async function handleAddItem(e) {
    e.preventDefault()

    if (!currentList) {
      setAddItemMessage('No current shopping list found.')
      return
    }

    if (!addItemId) {
      setAddItemMessage('Please select an item.')
      return
    }

    const quantityNumber = Number(addQuantity)

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      setAddItemMessage('Please enter a valid quantity greater than 0.')
      return
    }

    const existingItem = listItems.find(
      (listItem) => String(listItem.item_id) === String(addItemId)
    )

    if (existingItem) {
      setAddItemMessage(
        `"${existingItem.items?.name}" is already on the list. Quantity has not been changed.`
      )
      return
    }

    setAddItemLoading(true)
    setAddItemMessage(null)

    const newItem = {
      shopping_list_id: currentList.id,
      item_id: Number(addItemId),
      quantity_required: quantityNumber,
      quantity_bought: 0,
      note: null,
      unavailable: false,
    }

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .insert(newItem)

      setAddItemLoading(false)

      if (error) {
        throw error
      }

      await loadListItems(currentList.id)
    } catch (_error) {
      setAddItemLoading(false)

      const addedItem = allItems.find(
        (item) => String(item.id) === String(addItemId)
      )

      const localItem = {
        id: Date.now(),
        item_id: newItem.item_id,
        quantity_required: newItem.quantity_required,
        quantity_bought: 0,
        note: null,
        unavailable: false,
        items: {
          id: addedItem?.id ?? newItem.item_id,
          name: addedItem?.name || 'Item',
          category_id: addedItem?.category_id ?? null,
        },
        draftQuantity: String(newItem.quantity_required),
      }

      const updatedList = [...listItems, localItem]
      setListItems(updatedList)
      localStorage.setItem('listItems', JSON.stringify(updatedList))

      addToOfflineQueue({
        type: 'ADD_ITEM',
        payload: newItem,
      })

      setAddItemMessage('CATCH PATH HIT 12345')
      setAddItemId('')
      setAddQuantity('1')
      return
    }

    const addedItem = allItems.find((item) => String(item.id) === String(addItemId))
    setAddItemMessage(
      addedItem
        ? `"${addedItem.name}" added to the list.`
        : 'Item added to the list.'
    )
    setAddItemId('')
    setAddQuantity('1')
  }

  async function handleQuickCreateItem(e) {
    e.preventDefault()
    setAddItemMessage(null)

    const trimmedName = quickNewItemName.trim()

    if (!trimmedName) {
      setAddItemMessage('Please enter an item name.')
      return
    }

    if (!quickNewItemCategoryId) {
      setAddItemMessage('Please select a category for the new item.')
      return
    }

    const existingSavedItem = allItems.find(
      (item) => item.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )

    if (existingSavedItem) {
      setAddItemMessage(`"${trimmedName}" already exists in saved items.`)
      setAddItemId(String(existingSavedItem.id))
      setShowQuickCreateItem(false)
      return
    }

    setQuickCreateItemLoading(true)

    const { data, error } = await supabase
      .from('items')
      .insert({
        name: trimmedName,
        category_id: Number(quickNewItemCategoryId),
        regular: quickNewItemRegular,
        default_quantity: 1,
        default_note: null,
      })
      .select('id, name')
      .single()

    setQuickCreateItemLoading(false)

    if (error) {
      setAddItemMessage(`Error creating item: ${error.message}`)
      return
    }

    await loadAllItems()

    setAddItemId(String(data.id))
    setShowQuickCreateItem(false)
    setQuickNewItemName('')
    setQuickNewItemCategoryId('')
    setQuickNewItemRegular(false)
    setAddItemMessage(`"${data.name}" created. It is now selected for adding to the list.`)
  }

  async function handleCreateNewItem(e) {
    e.preventDefault()
    setEditMessage(null)

    const trimmedName = newItemName.trim()

    if (!trimmedName) {
      setEditMessage('Please enter an item name.')
      return
    }

    if (!newItemCategoryId) {
      setEditMessage('Please select a category.')
      return
    }

    const existingSavedItem = allItems.find(
      (item) => item.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )

    if (existingSavedItem) {
      setEditMessage(`"${trimmedName}" already exists.`)
      return
    }

    setCreateItemLoading(true)

    const { error } = await supabase
      .from('items')
      .insert({
        name: trimmedName,
        category_id: Number(newItemCategoryId),
        regular: newItemRegular,
        default_quantity: 1,
        default_note: null,
      })

    setCreateItemLoading(false)

    if (error) {
      setEditMessage(`Error creating item: ${error.message}`)
      return
    }

    setNewItemName('')
    setNewItemCategoryId('')
    setNewItemRegular(false)
    setShowCreateItem(false)
    setEditMessage(`"${trimmedName}" created.`)
    await loadAllItems()
  }

  function handleCategoryDraftChange(categoryId, field, value) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              [field]: value,
            }
          : category
      )
    )
  }

  async function handleCreateCategory(e) {
    e.preventDefault()
    setEditMessage(null)

    const trimmedName = newCategoryName.trim()

    if (!trimmedName) {
      setEditMessage('Please enter a category name.')
      return
    }

    if (newCategorySortOrder === '') {
      setEditMessage('Please enter a sort order.')
      return
    }

    const sortOrderNumber = Number(newCategorySortOrder)

    if (!Number.isFinite(sortOrderNumber)) {
      setEditMessage('Sort order must be a valid number.')
      return
    }

    const existingCategory = categories.find(
      (category) => category.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )

    if (existingCategory) {
      setEditMessage(`"${trimmedName}" already exists.`)
      return
    }

    const { error } = await supabase.from('categories').insert({
      name: trimmedName,
      sort_order: sortOrderNumber,
    })

    if (error) {
      setEditMessage(`Error creating category: ${error.message}`)
      return
    }

    setNewCategoryName('')
    setNewCategorySortOrder('')
    setEditMessage(`"${trimmedName}" created.`)
    await loadCategories()
  }

  async function handleSaveCategory(category) {
    setEditMessage(null)

    const trimmedName = category.draftName.trim()

    if (!trimmedName) {
      setEditMessage('Category name cannot be empty.')
      return
    }

    if (category.draftSortOrder === '') {
      setEditMessage('Sort order cannot be empty.')
      return
    }

    const sortOrderNumber = Number(category.draftSortOrder)

    if (!Number.isFinite(sortOrderNumber)) {
      setEditMessage('Sort order must be a valid number.')
      return
    }

    const duplicateCategory = categories.find(
      (otherCategory) =>
        otherCategory.id !== category.id &&
        otherCategory.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )

    if (duplicateCategory) {
      setEditMessage(`Another category already uses the name "${trimmedName}".`)
      return
    }

    setSavingCategoryId(category.id)

    const { error } = await supabase
      .from('categories')
      .update({
        name: trimmedName,
        sort_order: sortOrderNumber,
      })
      .eq('id', category.id)

    setSavingCategoryId(null)

    if (error) {
      setEditMessage(`Error saving category: ${error.message}`)
      return
    }

    setEditMessage(`"${trimmedName}" saved.`)
    await loadCategories()
  }

  async function handleDeleteCategory(category) {
    setEditMessage(null)

    const confirmed = window.confirm(`Delete category "${category.name}"?`)

    if (!confirmed) {
      return
    }

    setDeletingCategoryId(category.id)

    const { count, error: countError } = await supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', category.id)

    if (countError) {
      setDeletingCategoryId(null)
      setEditMessage(`Error checking category usage: ${countError.message}`)
      return
    }

    if ((count || 0) > 0) {
      setDeletingCategoryId(null)
      setEditMessage(
        `Cannot delete "${category.name}" because ${count} item${count === 1 ? '' : 's'} still use ${count === 1 ? 'it' : 'this category'}.`
      )
      return
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    setDeletingCategoryId(null)

    if (error) {
      setEditMessage(`Error deleting category: ${error.message}`)
      return
    }

    setEditMessage(`"${category.name}" deleted.`)
    await loadCategories()
  }

  function handleListItemDraftChange(listItemId, value) {
    setListItems((prev) =>
      prev.map((item) =>
        item.id === listItemId
          ? {
              ...item,
              draftQuantity: value,
            }
          : item
      )
    )
  }

  async function handleSaveListItemQuantity(listItem) {
    setEditMessage(null)

    const quantityNumber = Number(listItem.draftQuantity)

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      setEditMessage('Quantity must be a valid number greater than 0.')
      return
    }

    setSavingListItemId(listItem.id)

    const { error } = await supabase
      .from('shopping_list_items')
      .update({
        quantity_required: quantityNumber,
      })
      .eq('id', listItem.id)

    setSavingListItemId(null)

    if (error) {
      setEditMessage(`Error saving quantity: ${error.message}`)
      return
    }

    setEditMessage(`Quantity updated for "${listItem.items?.name}".`)

    if (currentList) {
      await loadListItems(currentList.id)
    }
  }

  async function handleRemoveListItem(listItem) {
    if (!currentList) {
      setEditMessage('No current shopping list found.')
      return
    }

    const itemName = listItem.items?.name || 'this item'
    const confirmed = window.confirm(`Remove "${itemName}" from the current list?`)

    if (!confirmed) {
      return
    }

    setRemovingListItemId(listItem.id)
    setEditMessage(null)

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', listItem.id)

    setRemovingListItemId(null)

    if (error) {
      setEditMessage(`Error removing item from list: ${error.message}`)
      return
    }

    await loadListItems(currentList.id)
    setEditMessage(`"${itemName}" removed from the current list.`)
  }

  function handleItemDraftChange(itemId, field, value) {
    setAllItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )
  }

  async function handleSaveItem(item) {
    setEditMessage(null)

    const trimmedName = item.draftName.trim()

    if (!trimmedName) {
      setEditMessage('Item name cannot be empty.')
      return
    }

    if (!item.draftCategoryId) {
      setEditMessage('Please choose a category for the item.')
      return
    }

    const duplicateItem = allItems.find(
      (otherItem) =>
        otherItem.id !== item.id &&
        otherItem.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )

    if (duplicateItem) {
      setEditMessage(`Another item already uses the name "${trimmedName}".`)
      return
    }

    setSavingItemId(item.id)

    const { error } = await supabase
      .from('items')
      .update({
        name: trimmedName,
        category_id: Number(item.draftCategoryId),
        regular: !!item.draftRegular,
      })
      .eq('id', item.id)

    setSavingItemId(null)

    if (error) {
      setEditMessage(`Error saving item: ${error.message}`)
      return
    }

    setEditMessage(`"${trimmedName}" saved.`)
    await loadAllItems()

    if (currentList) {
      await loadListItems(currentList.id)
    }
  }

  async function handleDeleteItem(item) {
    setEditMessage(null)

    const confirmed = window.confirm(`Delete item "${item.name}" from saved items?`)

    if (!confirmed) {
      return
    }

    setDeletingItemId(item.id)

    const { count, error: countError } = await supabase
      .from('shopping_list_items')
      .select('id', { count: 'exact', head: true })
      .eq('item_id', item.id)

    if (countError) {
      setDeletingItemId(null)
      setEditMessage(`Error checking item usage: ${countError.message}`)
      return
    }

    if ((count || 0) > 0) {
      setDeletingItemId(null)
      setEditMessage(
        `Cannot delete "${item.name}" because it is still used on ${count} shopping list item${count === 1 ? '' : 's'}.`
      )
      return
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id)

    setDeletingItemId(null)

    if (error) {
      setEditMessage(`Error deleting item: ${error.message}`)
      return
    }

    setEditMessage(`"${item.name}" deleted from saved items.`)
    await loadAllItems()
  }

  async function handleSetListItemBoughtQuantity(listItem, nextQuantityBought) {
    if (!currentList) {
      setShoppingModeMessage('No current shopping list found.')
      return
    }

    const quantityRequired = Number(listItem.quantity_required) || 0
    const safeNextQuantityBought = Math.max(0, Math.min(nextQuantityBought, quantityRequired))

    setUpdatingBoughtListItemId(listItem.id)
    setShoppingModeMessage(null)

    const updatedList = listItems.map((item) =>
      item.id === listItem.id
        ? {
            ...item,
            quantity_bought: safeNextQuantityBought,
          }
        : item
    )

    setListItems(updatedList)
    localStorage.setItem('listItems', JSON.stringify(updatedList))

    const { error } = await supabase
      .from('shopping_list_items')
      .update({
        quantity_bought: safeNextQuantityBought,
      })
      .eq('id', listItem.id)

    setUpdatingBoughtListItemId(null)

    if (error) {
      setShoppingModeMessage('Offline: change saved locally.')
      return
    }

    await loadListItems(currentList.id)
  }

  async function handleBoughtOne(listItem) {
    const currentBought = Number(listItem.quantity_bought) || 0
    await handleSetListItemBoughtQuantity(listItem, currentBought + 1)
  }

  async function handleMarkComplete(listItem) {
    const quantityRequired = Number(listItem.quantity_required) || 0
    await handleSetListItemBoughtQuantity(listItem, quantityRequired)
  }

  async function handleClearBought(listItem) {
    await handleSetListItemBoughtQuantity(listItem, 0)
  }

  async function handleFinishShopping() {
    if (!currentList) {
      setShoppingModeMessage('No current shopping list found.')
      return
    }

    setFinishingShopping(true)
    setShoppingModeMessage(null)

    const { error: deleteError } = await supabase
      .from('unavailable_items')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      setFinishingShopping(false)
      setShoppingModeMessage(`Error clearing unavailable items: ${deleteError.message}`)
      return
    }

    const unboughtItems = listItems.filter((listItem) => {
      const quantityRequired = Number(listItem.quantity_required) || 0
      const quantityBought = Number(listItem.quantity_bought) || 0
      return quantityBought < quantityRequired
    })

    if (unboughtItems.length === 0) {
      setFinishingShopping(false)
      setUnavailableItems([])
      setShoppingModeMessage('Shopping finished. No unavailable items.')
      return
    }

    const rows = unboughtItems.map((listItem) => ({
      item_id: Number(listItem.item_id),
      quantity: Math.max(
        1,
        (Number(listItem.quantity_required) || 0) - (Number(listItem.quantity_bought) || 0)
      ),
    }))

    const { error: insertError } = await supabase
      .from('unavailable_items')
      .insert(rows)

    setFinishingShopping(false)

    if (insertError) {
      setShoppingModeMessage(`Error saving unavailable items: ${insertError.message}`)
      return
    }

    setShoppingModeMessage(
      `${rows.length} unavailable item${rows.length === 1 ? '' : 's'} saved.`
    )

    if (showUnavailableItems) {
      await loadUnavailableItems()
    }
  }

  async function handleAddUnavailableItemToCurrentList(unavailableItem) {
    if (!currentList) {
      setUnavailableItemsMessage('No current shopping list found.')
      return
    }

    setAddingUnavailableItemId(unavailableItem.id)
    setUnavailableItemsMessage(null)

    const existingListItem = listItems.find(
      (listItem) => String(listItem.item_id) === String(unavailableItem.item_id)
    )

    if (existingListItem) {
      const currentRequired = Number(existingListItem.quantity_required) || 0
      const unavailableQuantity = Number(unavailableItem.quantity) || 1

      const confirmed = window.confirm(
        `"${unavailableItem.items?.name}" is already on the list (quantity ${currentRequired}). Add ${unavailableQuantity} more?`
      )

      if (!confirmed) {
        setAddingUnavailableItemId(null)
        return
      }

      const { error: updateError } = await supabase
        .from('shopping_list_items')
        .update({
          quantity_required: currentRequired + unavailableQuantity,
        })
        .eq('id', existingListItem.id)

      if (updateError) {
        setAddingUnavailableItemId(null)
        setUnavailableItemsMessage(`Error adding unavailable item: ${updateError.message}`)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('shopping_list_items')
        .insert({
          shopping_list_id: currentList.id,
          item_id: Number(unavailableItem.item_id),
          quantity_required: Number(unavailableItem.quantity) || 1,
          quantity_bought: 0,
          note: null,
          unavailable: false,
        })

      if (insertError) {
        setAddingUnavailableItemId(null)
        setUnavailableItemsMessage(`Error adding unavailable item: ${insertError.message}`)
        return
      }
    }

    const { error: deleteError } = await supabase
      .from('unavailable_items')
      .delete()
      .eq('id', unavailableItem.id)

    setAddingUnavailableItemId(null)

    if (deleteError) {
      setUnavailableItemsMessage(`Item added, but could not remove unavailable entry: ${deleteError.message}`)
    } else {
      setUnavailableItemsMessage(`"${unavailableItem.items?.name || 'Item'}" added to current list.`)
    }

    await loadListItems(currentList.id)
    await loadUnavailableItems()
  }

  async function handleRemoveUnavailableItem(unavailableItem) {
    setAddingUnavailableItemId(unavailableItem.id)
    setUnavailableItemsMessage(null)

    const { error } = await supabase
      .from('unavailable_items')
      .delete()
      .eq('id', unavailableItem.id)

    setAddingUnavailableItemId(null)

    if (error) {
      setUnavailableItemsMessage(`Error removing item: ${error.message}`)
      return
    }

    setUnavailableItemsMessage(`"${unavailableItem.items?.name || 'Item'}" removed.`)

    await loadUnavailableItems()
  }

  async function handleCreateNewList() {
    const confirmed = window.confirm('Start a new empty list?')

    if (!confirmed) {
      return
    }

    setError(null)
    setShowShoppingMode(false)
    setShowUnavailableItems(false)
    setShowAddItem(false)
    setShowEditPanel(false)
    setShowRegulars(false)

    setAddItemMessage(null)
    setEditMessage(null)
    setRegularsMessage(null)
    setShoppingModeMessage(null)
    setUnavailableItemsMessage(null)

    const previousCurrentListId = currentList?.id ?? null
    const now = new Date()
    const newListName = `Shopping List ${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}`

    if (previousCurrentListId) {
      const { error: unsetError } = await supabase
        .from('shopping_lists')
        .update({ is_current: false })
        .eq('id', previousCurrentListId)

      if (unsetError) {
        setError(`Error creating new list: ${unsetError.message}`)
        return
      }
    }

    const { data, error: insertError } = await supabase
      .from('shopping_lists')
      .insert({
        name: newListName,
        is_current: true,
      })
      .select('*')
      .single()

    if (insertError) {
      if (previousCurrentListId) {
        await supabase
          .from('shopping_lists')
          .update({ is_current: true })
          .eq('id', previousCurrentListId)
      }

      setError(`Error creating new list: ${insertError.message}`)
      return
    }

    setCurrentList(data)
    setListItems([])
    setUnavailableItems([])
    setRegularSelections({})
  }

  function handlePrintList() {
    if (!currentList) {
      setError('No current shopping list found.')
      return
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      setError('Unable to open print window.')
      return
    }

    const groupedHtml = groupedList
      .map(
        (group) => `
          <section style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 8px 0; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
              ${group.name}
            </h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${group.items
                .map(
                  (listItem) => `
                    <li style="padding: 6px 0; border-bottom: 1px solid #eee; font-size: 16px;">
                      ${listItem.items?.name || 'Unnamed item'}${Number(listItem.quantity_required) > 1 ? ` × ${Number(listItem.quantity_required)}` : ''}
                    </li>
                  `
                )
                .join('')}
            </ul>
          </section>
        `
      )
      .join('')

    printWindow.document.open()
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentList.name || 'Shopping List'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #000;
            }

            h1 {
              margin-top: 0;
              margin-bottom: 24px;
              font-size: 24px;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <h1>${currentList.name || 'Shopping List'}</h1>
          ${groupedHtml || '<p>No items in this list.</p>'}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  function handlePrintList() {
    if (!currentList) {
      setError('No current shopping list found.')
      return
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      setError('Unable to open print window.')
      return
    }

    const groupedItems = listItems.reduce((groups, listItem) => {
      const categoryName =
        categoryMap.get(String(listItem.items?.category_id))?.name || 'Uncategorized'

      if (!groups[categoryName]) {
        groups[categoryName] = []
      }

      groups[categoryName].push(listItem)
      return groups
    }, {})

    const groupedHtml = Object.entries(groupedItems)
      .map(
        ([categoryName, items]) => `
          <section style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 8px 0; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">${categoryName}</h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${items
                .map(
                  (listItem) => `
                    <li style="padding: 6px 0; border-bottom: 1px solid #eee; font-size: 16px;">
                      ${listItem.items?.name || 'Unnamed item'}${Number(listItem.quantity_required) > 1 ? ` × ${Number(listItem.quantity_required)}` : ''}
                    </li>
                  `
                )
                .join('')}
            </ul>
          </section>
        `
      )
      .join('')

    printWindow.document.open()
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentList.name || 'Shopping List'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #000;
            }

            h1 {
              margin-top: 0;
              margin-bottom: 24px;
              font-size: 24px;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <h1>${currentList.name || 'Shopping List'}</h1>
          ${groupedHtml || '<p>No items in this list.</p>'}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [String(category.id), category]))
  }, [categories])

  const sortedItemsForAdd = useMemo(() => {
    return [...allItems].sort((a, b) => {
      const categoryA = categoryMap.get(String(a.category_id))
      const categoryB = categoryMap.get(String(b.category_id))

      const sortA =
        categoryA && categoryA.sort_order !== null && categoryA.sort_order !== undefined
          ? categoryA.sort_order
          : Number.MAX_SAFE_INTEGER
      const sortB =
        categoryB && categoryB.sort_order !== null && categoryB.sort_order !== undefined
          ? categoryB.sort_order
          : Number.MAX_SAFE_INTEGER

      if (sortA !== sortB) {
        return sortA - sortB
      }

      const categoryNameA = categoryA?.name || 'Uncategorized'
      const categoryNameB = categoryB?.name || 'Uncategorized'
      const categoryCompare = categoryNameA.localeCompare(categoryNameB)

      if (categoryCompare !== 0) {
        return categoryCompare
      }

      return a.name.localeCompare(b.name)
    })
  }, [allItems, categoryMap])

  const filteredItemsForAdd = useMemo(() => {
    const search = addItemSearch.trim().toLowerCase()

    if (!search) {
      return sortedItemsForAdd
    }

    return sortedItemsForAdd.filter((item) => {
      const categoryName = categoryMap.get(String(item.category_id))?.name || 'Uncategorized'

      return (
        item.name.toLowerCase().includes(search) ||
        categoryName.toLowerCase().includes(search)
      )
    })
  }, [sortedItemsForAdd, addItemSearch, categoryMap])

  const groupedRegularItems = useMemo(() => {
    const currentListItemIds = new Set(listItems.map((item) => String(item.item_id)))
    const groupsMap = new Map()

    sortedItemsForAdd
      .filter((item) => item.regular)
      .forEach((item) => {
        const category = categoryMap.get(String(item.category_id))
        const groupKey = category ? String(category.id) : 'uncategorized'
        const selection = regularSelections[String(item.id)]
        const itemForView = {
          ...item,
          isAlreadyOnList: currentListItemIds.has(String(item.id)),
          quantity:
            selection?.quantity ??
            (item.default_quantity === null || item.default_quantity === undefined
              ? '1'
              : String(item.default_quantity)),
          selected: !!selection?.selected,
          categoryName: category?.name || 'Uncategorized',
        }

        if (!groupsMap.has(groupKey)) {
          groupsMap.set(groupKey, {
            key: groupKey,
            name: category?.name || 'Uncategorized',
            sortOrder:
              category && category.sort_order !== null && category.sort_order !== undefined
                ? category.sort_order
                : Number.MAX_SAFE_INTEGER,
            items: [],
          })
        }

        groupsMap.get(groupKey).items.push(itemForView)
      })

    return Array.from(groupsMap.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }

      return a.name.localeCompare(b.name)
    })
  }, [sortedItemsForAdd, categoryMap, listItems, regularSelections])

  const groupedList = useMemo(() => {
    const groupsMap = new Map()

    listItems.forEach((listItem) => {
      const categoryId = listItem.items?.category_id ?? null
      const matchedCategory = categoryId ? categoryMap.get(String(categoryId)) : null

      const groupKey = matchedCategory ? String(matchedCategory.id) : 'uncategorized'
      const existingGroup = groupsMap.get(groupKey)

      if (existingGroup) {
        existingGroup.items.push(listItem)
      } else {
        groupsMap.set(groupKey, {
          key: groupKey,
          name: matchedCategory ? matchedCategory.name : 'Uncategorized',
          sortOrder:
            matchedCategory && matchedCategory.sort_order !== null && matchedCategory.sort_order !== undefined
              ? matchedCategory.sort_order
              : Number.MAX_SAFE_INTEGER,
          items: [listItem],
        })
      }
    })

    return Array.from(groupsMap.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }
      return a.name.localeCompare(b.name)
    })
  }, [listItems, categoryMap])

  const groupedShoppingList = useMemo(() => {
    return groupedList.map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        const aComplete = (Number(a.quantity_bought) || 0) >= (Number(a.quantity_required) || 0)
        const bComplete = (Number(b.quantity_bought) || 0) >= (Number(b.quantity_required) || 0)

        if (aComplete !== bComplete) {
          return aComplete ? 1 : -1
        }

        return (a.items?.name || '').localeCompare(b.items?.name || '')
      }),
    }))
  }, [groupedList])

  const selectedEditListItem =
    listItems.find((item) => String(item.id) === String(selectedEditListItemId)) || null

  const selectedEditSavedItem =
    allItems.find((item) => String(item.id) === String(selectedEditSavedItemId)) || null

  const showCurrentList =
    !showShoppingMode && !showUnavailableItems && !showAddItem && !showEditPanel && !showRegulars

  if (!session) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Shopping App</h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <label>Email</label>
            <br />
            <input name="email" type="email" />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Password</label>
            <br />
            <input name="password" type="password" />
          </div>

          <button type="submit">Sign in</button>
        </form>

        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <button onClick={handleLogout}>Sign out</button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={handleOpenShoppingMode}
          style={{
            minHeight: '52px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '10px',
          }}
        >
          Shopping Mode
        </button>
        <button
          onClick={handleOpenAddItem}
          style={{
            minHeight: '52px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '10px',
          }}
        >
          Add Item LIVE TEST 777
        </button>
        <button
          onClick={handleOpenRegulars}
          style={{
            minHeight: '52px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '10px',
          }}
        >
          Regulars
        </button>
        <button
          onClick={handleOpenUnavailableItems}
          style={{
            minHeight: '52px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '10px',
          }}
        >
          Unavailable
        </button>
        <button
          onClick={() => handleOpenEditPanel('currentList')}
          style={{
            minHeight: '52px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '10px',
          }}
        >
          Edit
        </button>
        <button
          onClick={handleCreateNewList}
          style={{
            minHeight: '52px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '10px',
          }}
        >
          New List
        </button>
        <button
          onClick={handlePrintList}
          style={{
            minHeight: '52px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '10px',
            gridColumn: '1 / -1',
          }}
        >
          Print
        </button>
      </div>

      {showShoppingMode && (
        <ShoppingMode
          currentList={currentList}
          error={error}
          groupedList={groupedShoppingList}
          message={shoppingModeMessage}
          updatingBoughtListItemId={updatingBoughtListItemId}
          onClose={handleCloseShoppingMode}
          onBoughtOne={handleBoughtOne}
          onMarkComplete={handleMarkComplete}
          onClearBought={handleClearBought}
          onFinishShopping={handleFinishShopping}
          finishingShopping={finishingShopping}
        />
      )}

      {showUnavailableItems && (
        <UnavailableItems
          unavailableItems={unavailableItems}
          loading={unavailableItemsLoading}
          message={unavailableItemsMessage}
          addingUnavailableItemId={addingUnavailableItemId}
          onClose={handleCloseUnavailableItems}
          onAddToCurrentList={handleAddUnavailableItemToCurrentList}
          onRemoveItem={handleRemoveUnavailableItem}
        />
      )}

      {showRegulars && (
        <RegularsPanel
          groupedRegularItems={groupedRegularItems}
          message={regularsMessage}
          addingRegulars={addingRegulars}
          onAddSelected={handleAddSelectedRegulars}
          onClose={handleCloseRegulars}
          onQuantityChange={handleRegularQuantityChange}
          onToggleItem={handleRegularSelectionChange}
        />
      )}

      {showAddItem && (
        <AddItemPanel
          addItemId={addItemId}
          addItemLoading={addItemLoading}
          addItemMessage={addItemMessage}
          addItemSearch={addItemSearch}
          addQuantity={addQuantity}
          categories={categories}
          categoryMap={categoryMap}
          filteredItemsForAdd={filteredItemsForAdd}
          quickCreateItemLoading={quickCreateItemLoading}
          quickNewItemCategoryId={quickNewItemCategoryId}
          quickNewItemName={quickNewItemName}
          quickNewItemRegular={quickNewItemRegular}
          showQuickCreateItem={showQuickCreateItem}
          onAddItem={handleAddItem}
          onClose={handleCloseAddItem}
          onQuickCreateItem={handleQuickCreateItem}
          onSetAddItemId={setAddItemId}
          onSetAddItemMessage={setAddItemMessage}
          onSetAddItemSearch={setAddItemSearch}
          onSetAddQuantity={setAddQuantity}
          onSetQuickNewItemCategoryId={setQuickNewItemCategoryId}
          onSetQuickNewItemName={setQuickNewItemName}
          onSetQuickNewItemRegular={setQuickNewItemRegular}
          onToggleQuickCreateItem={() => {
            setShowQuickCreateItem(!showQuickCreateItem)
            setAddItemMessage(null)
          }}
        />
      )}

      {showEditPanel && (
        <EditPanel
          allItems={allItems}
          categories={categories}
          createItemLoading={createItemLoading}
          deletingCategoryId={deletingCategoryId}
          deletingItemId={deletingItemId}
          editMessage={editMessage}
          editSection={editSection}
          listItems={listItems}
          newCategoryName={newCategoryName}
          newCategorySortOrder={newCategorySortOrder}
          newItemCategoryId={newItemCategoryId}
          newItemName={newItemName}
          newItemRegular={newItemRegular}
          removingListItemId={removingListItemId}
          savingCategoryId={savingCategoryId}
          savingItemId={savingItemId}
          savingListItemId={savingListItemId}
          selectedEditListItem={selectedEditListItem}
          selectedEditListItemId={selectedEditListItemId}
          selectedEditSavedItem={selectedEditSavedItem}
          selectedEditSavedItemId={selectedEditSavedItemId}
          showCreateItem={showCreateItem}
          sortedItemsForAdd={sortedItemsForAdd}
          onCategoryDraftChange={handleCategoryDraftChange}
          onClose={handleCloseEditPanel}
          onCreateCategory={handleCreateCategory}
          onCreateNewItem={handleCreateNewItem}
          onDeleteCategory={handleDeleteCategory}
          onDeleteItem={handleDeleteItem}
          onItemDraftChange={handleItemDraftChange}
          onListItemDraftChange={handleListItemDraftChange}
          onOpenSection={handleOpenEditPanel}
          onRemoveListItem={handleRemoveListItem}
          onSaveCategory={handleSaveCategory}
          onSaveItem={handleSaveItem}
          onSaveListItemQuantity={handleSaveListItemQuantity}
          onSetNewCategoryName={setNewCategoryName}
          onSetNewCategorySortOrder={setNewCategorySortOrder}
          onSetNewItemCategoryId={setNewItemCategoryId}
          onSetNewItemName={setNewItemName}
          onSetNewItemRegular={setNewItemRegular}
          onSetSelectedEditListItemId={setSelectedEditListItemId}
          onSetSelectedEditSavedItemId={setSelectedEditSavedItemId}
          onToggleShowCreateItem={() => {
            setShowCreateItem(!showCreateItem)
            setEditMessage(null)
          }}
        />
      )}

      {showCurrentList && (
        <CurrentList
          currentList={currentList}
          error={error}
          groupedList={groupedList}
          listItems={listItems}
        />
      )}
    </div>
  )
}

export default App
