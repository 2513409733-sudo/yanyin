import { Platform } from 'react-native'

// Pixel shadow helper (iOS shadow + Android elevation)
export const pixelShadow = (color = '#3d3d3d', size = 3) => ({
  shadowColor: color,
  shadowOffset: { width: size, height: size },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: size + 1,
})

// Base pixel card style
export const pcard = (theme) => ({
  backgroundColor: '#fffef5',
  borderWidth: 3,
  borderColor: '#3d3d3d',
  ...pixelShadow(),
})

// Base pixel button style
export const pbtn = {
  borderWidth: 3,
  borderColor: '#3d3d3d',
  backgroundColor: '#fffef5',
  ...pixelShadow(),
}

// Primary button
export const pbtnPrimary = (primaryColor) => ({
  borderWidth: 3,
  borderColor: '#3d3d3d',
  backgroundColor: primaryColor || '#FD85AB',
  ...pixelShadow(),
})

// Font helper
export const font = (size = 14, weight = 'normal') => ({
  fontFamily: 'Cubic11',
  fontSize: size,
  fontWeight: weight,
  includeFontPadding: false,
})
