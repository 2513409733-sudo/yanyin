// Shim for expo-image-picker using HTML file input
export const MediaTypeOptions = { Images: 'Images', Videos: 'Videos', All: 'All' }
export const UIImagePickerPresentationStyle = { FULL_SCREEN: 'FULL_SCREEN' }

const openFilePicker = (accept = 'image/*') =>
  new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return resolve({ canceled: true, assets: null })
      const uri = URL.createObjectURL(file)
      resolve({ canceled: false, assets: [{ uri, fileName: file.name, type: file.type }] })
    }
    input.oncancel = () => resolve({ canceled: true, assets: null })
    input.click()
  })

export const launchImageLibraryAsync = ({ mediaTypes, ...opts } = {}) =>
  openFilePicker('image/*')

export const launchCameraAsync = (opts) =>
  openFilePicker('image/*')

export const requestMediaLibraryPermissionsAsync = async () => ({ granted: true, status: 'granted' })
export const requestCameraPermissionsAsync = async () => ({ granted: true, status: 'granted' })
export const getMediaLibraryPermissionsAsync = async () => ({ granted: true, status: 'granted' })
