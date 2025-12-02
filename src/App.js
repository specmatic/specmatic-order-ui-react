import React, { useState, useEffect } from "react"
import axios from "axios"
import './App.css'

const VALID_TYPES = ['book', 'gadget', 'food', 'other']

const App = ({ type }) => {
    const [query, setQuery] = useState(type)
    const [products, setProducts] = useState(null)
    const [error, setError] = useState('')

    // New product form state
    const [newName, setNewName] = useState('')
    const [newType, setNewType] = useState(VALID_TYPES[0])
    const [newInventory, setNewInventory] = useState('')
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Toggle visibility of create form
    const [showCreate, setShowCreate] = useState(false)

    useEffect(() => {
        setQuery(type)
    }, [type])

    // Extracted fetch logic so it can be reused after create
    const fetchProducts = async (q) => {
        if (q && !VALID_TYPES.includes(q)) {
            setError(`Invalid type. Allowed: ${VALID_TYPES.join(', ')}`)
            setProducts(null)
            return
        }

        try {
            setError('')
            setProducts(null) // show loading
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/findAvailableProducts?type=${q}`,
                { timeout: 1000, headers: { pageSize: 10 } }
            )
            setProducts(response.data)
        } catch (e) {
            if (e.code === 'ECONNABORTED') {
                setError('Timeout! Please try again...')
            } else {
                setError(e.response?.data?.message || e.message || 'An unexpected error occurred')
            }
        }
    }

    useEffect(() => {
        fetchProducts(query)
    }, [query])

    // Create product by calling /products endpoint
    const createProduct = async (e) => {
        e.preventDefault()
        setSubmitError('')
        setSubmitSuccess('')

        // basic validation
        if (!newName.trim()) {
            setSubmitError('Name is required')
            return
        }
        if (!VALID_TYPES.includes(newType)) {
            setSubmitError(`Invalid type. Allowed: ${VALID_TYPES.join(', ')}`)
            return
        }
        const inv = Number(newInventory)
        if (!Number.isInteger(inv) || inv < 0) {
            setSubmitError('Inventory must be a non-negative integer')
            return
        }

        try {
            setSubmitting(true)
            const payload = { name: newName.trim(), type: newType, inventory: inv }
            await axios.post(`${process.env.REACT_APP_API_URL}/products`, payload, { timeout: 2000 })
            setSubmitSuccess('Product created successfully')
            setNewName('')
            setNewType(VALID_TYPES[0])
            setNewInventory('')

            // refresh list for current query
            await fetchProducts(query)
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setSubmitError('Timeout! Please try again...')
            } else {
                setSubmitError(err.response?.data?.message || err.message || 'Failed to create product')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="App">
            <header className="app-header">
                <h1>Product Search</h1>
            </header>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Enter type (book, gadget, food, other)"
                    value={query || ''}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Toggle button to show/hide create form */}
            <div className="create-toggle">
                <button
                    className="btn btn-accent"
                    type="button"
                    onClick={() => setShowCreate(s => !s)}
                    aria-expanded={showCreate}
                >
                    {showCreate ? 'Close' : 'Add Product'}
                </button>
            </div>

            {/* New Product Form - shown only when toggled */}
            {showCreate && (
                <div className="create-container">
                    <h2 className="create-title">Create product</h2>
                    <form className="create-form" onSubmit={createProduct} noValidate>
                        <div className="form-row">
                            <label className="form-label" htmlFor="prod-name">Name</label>
                            <input
                                id="prod-name"
                                className="form-input"
                                placeholder="Product name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                aria-required="true"
                            />
                        </div>

                        <div className="form-row two-col">
                            <div>
                                <label className="form-label" htmlFor="prod-type">Type</label>
                                <select
                                    id="prod-type"
                                    className="form-select"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                >
                                    {VALID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="prod-inv">Inventory</label>
                                <input
                                    id="prod-inv"
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={newInventory}
                                    onChange={(e) => setNewInventory(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create product'}
                            </button>
                        </div>

                        {submitError && <div className="message form-error">{submitError}</div>}
                        {submitSuccess && <div className="message form-success">{submitSuccess}</div>}
                    </form>
                </div>
            )}

            <div className="results-container">
                {error ? (
                    <div className="message error">{error}</div>
                ) : (
                    products === null ? (
                        <div className="message loading">Loading...</div>
                    ) : products.length === 0 ? (
                        <div className="message no-results">No Products found</div>
                    ) : (
                        <div className="product-grid">
                            {products.map((product, index) => (
                                <div key={index} className="product-card">
                                    <span className="product-label">Product name</span>
                                    <h3 className="product-value">{product.name}</h3>
                                    <span className="product-label">Inventory</span>
                                    <h4 className="product-value">{product.inventory}</h4>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default App
