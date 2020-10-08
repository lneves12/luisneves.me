import React from "react"
import { Link } from "gatsby"
import {RiArrowLeftSLine, RiBugLine, RiSkullLine} from "react-icons/ri"

import SEO from "../components/seo"
import Layout from "../components/layout"

const NotFound = () => (
  <Layout className="not-found-page">
    <SEO title="Page not found"/>
    <div className="wrapper" style={{
      textAlign: "center"
    }}>
      <header>
        <RiSkullLine style={{
          fontSize: "128px",
          color: "var(--primary-color)"
        }}/>
        <h1>404 - not found</h1>
        <p>the page you are looking for is currently unavailable</p>
      </header>
      <Link to="/" className="button"><RiArrowLeftSLine className="icon -left"/>Back to Homepage</Link>
    </div>
  </Layout>
)

export default NotFound