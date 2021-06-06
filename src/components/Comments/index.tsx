/* eslint-disable prettier/prettier */
// eslint-disable-next-line no-use-before-define
import React, { Component } from 'react';

export default class Comments extends Component {
  private commentBox: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.commentBox = React.createRef();
  }

  componentDidMount() {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', 'true');
    scriptEl.setAttribute('repo', 'acretelli/rocketseat-blog-with-prismic');
    scriptEl.setAttribute('issue-term', 'url');
    scriptEl.setAttribute('theme', 'github-dark');
    this.commentBox.current.appendChild(scriptEl);
  }

  render() {
    return (
      <div style={{ width: '100%' }} id="comments">
        <h4>Comments</h4>
        <div ref={this.commentBox} />
      </div>
    )
  }
}
