import React from 'react';
const Footer: React.FC =()=> {
  return (
    <footer className="app-footer m-0  border-top mt-auto bg-light">
      <small>© {new Date().getFullYear()} Stock Admin System</small>
    </footer>
  )
}
export default Footer;