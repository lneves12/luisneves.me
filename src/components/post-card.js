import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

const PostCard = ({ data }) => {

  const targetSlugUrl = `/${data.frontmatter.slug}`;

  let featuredContent;
  if(data.frontmatter.featuredImage) {
    featuredContent = <Link to={targetSlugUrl}>
      <Img
        fluid={data.frontmatter.featuredImage.childImageSharp.fluid}
        objectFit="cover"
        objectPosition="50% 50%"
        alt={data.frontmatter.title + ' - Featured image'}
        className="featured-image"
      />
    </Link>
  } else {
    featuredContent = <Link className="description" to={targetSlugUrl}>{data.excerpt}</Link>;
  }


  return (
    <article className="post-card">


      <div class="post-content">
        <h2 className="title"><Link to={targetSlugUrl}>{data.frontmatter.title}</Link></h2>
        <p className="meta">
          <time>{data.frontmatter.date}</time>
        </p>
      </div>
      {featuredContent}
    </article>
  )
}

export default PostCard