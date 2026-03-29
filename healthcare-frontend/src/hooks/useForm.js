import { useState } from 'react'

export default function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function reset(nextValues = initialValues) {
    setValues(nextValues)
  }

  return { values, handleChange, reset, setValues }
}


