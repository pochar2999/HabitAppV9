import React from 'react'
import Layout from '../components/Layout'

export default function Support() {
  return (
    <Layout title="Support & Hotline">
      <div className="support-content">
        <div className="support-intro">
          <img 
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=120&h=120&fit=crop&crop=center" 
            alt="Support" 
            className="support-image"
          />
          <h3>You're Not Alone</h3>
          <p>Breaking habits can be challenging. If you're struggling, professional support is available.</p>
        </div>
        
        <div className="hotline-list">
          <div className="hotline-card">
            <h4>General Support</h4>
            <p>24/7 Crisis and Support</p>
            <div className="phone-number">1-800-EXAMPLE</div>
          </div>
          
          <div className="hotline-card">
            <h4>Addiction Support</h4>
            <p>Substance Abuse Helpline</p>
            <div className="phone-number">1-800-HELP-NOW</div>
          </div>
          
          <div className="hotline-card">
            <h4>Mental Health</h4>
            <p>Mental Health Crisis Line</p>
            <div className="phone-number">1-800-MENTAL</div>
          </div>
        </div>
        
        <div className="emergency-note">
          <p><strong>In case of emergency:</strong> Call 911 or go to your nearest emergency room.</p>
        </div>
      </div>
    </Layout>
  )
}