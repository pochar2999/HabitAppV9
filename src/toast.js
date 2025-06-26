// Toast notification system
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container')
  
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  
  container.appendChild(toast)
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100)
  
  // Remove toast
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => container.removeChild(toast), 300)
  }, duration)
}

// Add toast styles to the page
const toastStyles = `
  #toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .toast {
    background: white;
    color: #333;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    border-left: 4px solid #667eea;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
  }
  
  .toast.show {
    transform: translateX(0);
    opacity: 1;
  }
  
  .toast-success {
    border-left-color: #48bb78;
    background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(56, 161, 105, 0.1));
  }
  
  .toast-error {
    border-left-color: #f56565;
    background: linear-gradient(135deg, rgba(245, 101, 101, 0.1), rgba(229, 62, 62, 0.1));
  }
  
  .toast-info {
    border-left-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  }
  
  @media (max-width: 480px) {
    #toast-container {
      left: 20px;
      right: 20px;
      top: 20px;
    }
    
    .toast {
      max-width: none;
    }
  }
`

// Inject styles
const styleSheet = document.createElement('style')
styleSheet.textContent = toastStyles
document.head.appendChild(styleSheet)