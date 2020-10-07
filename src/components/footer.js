import React from "react"
import {Link} from "gatsby"
import { RiTwitterLine } from "react-icons/ri";

const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <RiTwitterLine />
      <p><Link to="/">luisneves.me</Link></p>
    </div>
  </footer>
)

export default Footer