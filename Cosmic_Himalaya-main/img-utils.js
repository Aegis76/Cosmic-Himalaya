/**
 * Reusable debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Transforms a local image path to an ImageKit CDN URL.
 * If the path is already a full URL, it returns it as is.
 * @param {string} path - The image path or URL.
 * @param {string} [transformation] - Optional ImageKit transformation parameters.
 * @returns {string} The transformed URL.
 */
function getImgUrl(path, transformation = "tr=w-1200,q-80,f-auto") {
  if (!path) return "";
  
  // 1. If it's already a full URL, return it as is
  if (path.startsWith("http")) return path;

  // 2. Return the local path as is for migration phase
  return path;
}

/**
 * Automatically transforms all static <img> tags to use the ImageKit CDN
 * if they point to a local path (don't start with http).
 */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    const noIk = img.hasAttribute('data-no-ik');

    if (src && !src.startsWith('http') && src.trim() !== "" && !noIk) {
      // Use different dimensions based on the context
      let tr = "tr=w-1200,q-80,f-auto"; // default
      
      if (img.closest('.trek-card') || img.closest('.cat-item')) {
        tr = "tr=w-800,q-80,f-auto";
      } else if (img.classList.contains('logo-icon')) {
        tr = "tr=w-100,q-100,f-auto";
      }

      img.src = getImgUrl(src, tr);
    }
    
    // Auto-apply lazy loading if not already set and not a hero image
    if (!img.getAttribute('loading') && !img.closest('.hero-slider') && !img.closest('.hero')) {
      img.setAttribute('loading', 'lazy');
    }
  });
});
