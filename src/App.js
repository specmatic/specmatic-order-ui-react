import React, { useState, useEffect } from "react"
import axios from "axios"
import './App.css'

const VALID_TYPES = ['book', 'gadget', 'food', 'other']

const App = ({ type }) => {
    const [query, setQuery] = useState(type)
    const [products, setProducts] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        setQuery(type)
    }, [type])

    useEffect(() => {
        if (query && !VALID_TYPES.includes(query)) {
            setError(`Invalid type. Allowed: ${VALID_TYPES.join(', ')}`)
            setProducts(null)
            return
        }

        const apiCall = async () => {
            try {
                setError('')
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/findAvailableProducts?type=${query}`,
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

        apiCall()
    }, [query])

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
