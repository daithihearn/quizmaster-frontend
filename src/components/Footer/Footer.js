import React, { Component } from 'react';
import footerLogo from '../../assets/img/brand/footer.png';

class DefaultFooter extends Component {
  render() {
    return (
      <div>
        <div className="footer">
          <div className="footer-content">
            <div className="footer-list_logo">
              <img className="footerLogoIssuer" src={footerLogo} alt="logo" />
            </div>
            <div className="footer-list_Nav">
              <div className="footer-list_content"> Privacy </div>
              <div className="footer-list_content"> Terms & Conditions </div>
              <div className="footer-list_content"> Accessibility </div>
            </div>
            <div className="footer-list_Ad">Quizmaster</div>
          </div>
        </div>
      </div>
    );
  }
}

export default DefaultFooter;
