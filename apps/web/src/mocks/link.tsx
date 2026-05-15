// mocks/next/link.js
import React from "react";

const Link = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return <a {...props}>{props.children}</a>;
};

export default Link;
