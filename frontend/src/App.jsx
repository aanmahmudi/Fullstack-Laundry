import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyAccount from './pages/auth/VerifyAccount'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyReset from './pages/auth/VerifyReset'
import NewPassword from './pages/auth/NewPassword'
import Products from './pages/products/List'
import ProductDetail from './pages/products/Detail'
import Cart from './pages/cart/Cart'
import Checkout from './pages/checkout/Checkout'
import Orders from './pages/orders/List'
import OrderDetail from './pages/orders/Detail'
import Header from './components/Header'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])

  useEffect(() => {
    // Load user and cart from localStorage
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    const savedCart = localStorage.getItem('cart')

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const addToCart = (product, quantity = 1) => {
    const existing = cart.find(item => item.id === product.id)
    let newCart

    if (existing) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      )
    } else {
      newCart = [...cart, { ...product, quantity }]
    }

    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
  }

  return (
    <div className="app">
      <Header user={user} logout={logout} cartCount={cart.length} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" /> : <Login setUser={setUser} />
            }
          />
          <Route
            path="/register"
            element={
              user ? <Navigate to="/" /> : <Register />
            }
          />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset" element={<VerifyReset />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route
            path="/products"
            element={<Products addToCart={addToCart} />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetail addToCart={addToCart} />}
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              user ? (
                <Checkout cart={cart} clearCart={clearCart} user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/orders"
            element={
              user ? <Orders user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/orders/:id"
            element={
              user ? <OrderDetail user={user} /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
