'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useVetCareStore } from '@/store'
import { Card, Badge, Button } from '@/components/ui'
import { inventoryApi } from '@/lib/api'

export default function InventoryView() {
  const { inventory, setInventory, openModal } = useVetCareStore()

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    try {
      await inventoryApi.delete(id)
      setInventory(inventory.filter(i => i.id !== id))
    } catch (err) {
      console.error('Failed to delete inventory item:', err.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pharmacy & Inventory</h1>
        <Button onClick={() => openModal('inventory')}>
          <Plus size={18} /> Add Item
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-4 font-medium">Item Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Unit Price</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4">
                    <Badge color={
                      item.category === 'Medicine'  ? 'blue'
                      : item.category === 'Food'    ? 'green'
                      : item.category === 'Equipment' ? 'indigo'
                      : 'gray'
                    }>
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        Number(item.stock) < (item.lowStockThreshold ?? 10)
                          ? 'text-red-500'
                          : 'text-gray-700 dark:text-zinc-300'
                      }`}>
                        {item.stock}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">{item.unit}</span>
                      {Number(item.stock) < (item.lowStockThreshold ?? 10) && (
                        <span className="text-xs text-red-400 font-medium">Low</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">${Number(item.price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-gray-400 dark:text-zinc-500 text-sm">
                    No inventory items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
