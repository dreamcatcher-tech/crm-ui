import { useState, useEffect, useMemo } from 'react'
import type { Customer } from '../../../types'

const simulateSave = async (customer: Customer): Promise<Customer> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate random failure (50% chance)
  if (Math.random() < 0.5) {
    throw new Error('Failed to save changes. Please try again.');
  }
  
  return customer;
};

interface UseEditDrawerProps {
  customer: Customer
  onClose: () => void
  onSave: (updatedCustomer: Customer) => void
}

export const useEditDrawer = ({ customer, onClose, onSave }: UseEditDrawerProps) => {
  const [formData, setFormData] = useState(customer)
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set())
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const hasChanges = useMemo(() => changedFields.size > 0, [changedFields])

  useEffect(() => {
    setFormData(customer)
    setChangedFields(new Set())
  }, [customer])

  const handleFieldChange = (
    field: string,
    value: unknown,
    parentField?: string
  ) => {
    setFormData(prev => {
      const newData = parentField
        ? { ...prev, [parentField]: { ...prev[parentField], [field]: value } }
        : { ...prev, [field]: value }

      // Compare with original customer data, use optional chaining here:
      const originalValue = parentField
        ? customer[parentField]?.[field]
        : customer[field]

      const newChangedFields = new Set(changedFields)
      if (value !== originalValue) {
        newChangedFields.add(parentField ? `${parentField}.${field}` : field)
      } else {
        newChangedFields.delete(parentField ? `${parentField}.${field}` : field)
      }

      setChangedFields(newChangedFields)
      return newData
    })
  }

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedPrompt(true)
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    setFormData(customer)
    setChangedFields(new Set())
    onClose()
  }

  const handleConfirmClose = () => {
    setFormData(customer)
    setChangedFields(new Set())
    setShowUnsavedPrompt(false)
    onClose()
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const savedCustomer = await simulateSave(formData)
      onSave(savedCustomer)
      setShowSuccess(true)
      // Close after showing success message briefly
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1500)
    } catch (error) {
      setSaveError((error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    formData,
    changedFields,
    showUnsavedPrompt,
    isSaving,
    saveError,
    showSuccess,
    setSaveError,
    hasChanges,
    setShowUnsavedPrompt,
    handleFieldChange,
    handleClose,
    handleCancel,
    handleConfirmClose,
    handleSubmit
  }
}
