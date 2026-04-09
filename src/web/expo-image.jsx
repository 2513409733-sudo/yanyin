// Shim for expo-image: renders a plain img tag on web
import React from 'react'

export const Image = ({ source, style, contentFit, ...rest }) => {
  const uri = typeof source === 'object' ? source?.uri : source
  const objFit = contentFit === 'cover' ? 'cover'
    : contentFit === 'contain' ? 'contain'
    : contentFit === 'fill' ? 'fill'
    : 'cover'

  const flatStyle = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style || {})
  return (
    <img
      src={uri}
      style={{ objectFit: objFit, ...flatStyle }}
      {...rest}
    />
  )
}

export default Image
