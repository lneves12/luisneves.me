import React from "react"
import { RiGithubFill, RiTwitterFill, RiLinkedinFill } from "react-icons/ri";

const Social = (props) => (
  <div className="social-icons-container">
      <a href="https://www.twitter.com/luis_neves12" target="_blank">
        <RiTwitterFill size={props.size} />
      </a>
      <a href="https://github.com/lneves12" target="_blank">
        <RiGithubFill size={props.size} />
      </a>
      <a href="https://www.linkedin.com/in/luis-neves-716a2236/" target="_blank">
        <RiLinkedinFill size={props.size} />
      </a>
  </div>
)

export default Social