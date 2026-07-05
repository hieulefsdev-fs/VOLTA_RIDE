import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import AppRouter from './AppRouter.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
    <Toaster position="top-right" />
  </React.StrictMode>
)
