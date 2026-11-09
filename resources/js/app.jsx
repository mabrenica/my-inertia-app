import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

createInertiaApp({
  // This tells Inertia where to find your page components
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  // This mounts the React app into the HTML template container
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
