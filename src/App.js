import React, { useEffect, useState } from "react"
import axios from "axios"

const App = ({ type }) => {
    const [products, setProducts] = useState(null)
    const [error, setError] = useState('')
    useEffect(() => {
        const apiCall = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/findAvailableProducts?type=${type}`,
                    {
                        timeout: 1000,
                        headers: {
                            pageSize: 10
                        }
                    }
                )
                setProducts(response.data)
            } catch {
                setError('Timeout! Please try again...')
            }
        }
        apiCall()
    }, [type])
    return (
        <div>
            <h1>Gadgets</h1>
            {(error === "" && products != null) ? (
                <>
                {
                    products.length === 0 ? (
                        <p>No Products found</p>
                    ) : (
                        <ul>
                            {products.map((product) => (
                                <li key={product.id}>
                                    <p>Product name</p>
                                    <p>{product.name}</p>
                                </li>
                            ))}
                        </ul>
                    )
                }</>
            ) : (error)
            }
        </div>
    )
}

export default App
